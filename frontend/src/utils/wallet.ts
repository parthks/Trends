import { createDataItemSigner, dryrun, message, result } from "@permaweb/aoconnect";
import { ProcessId } from "./constants";
// import type { MessageResult } from "@permaweb/aoconnect/dist/lib/result";

type MessageResult = {
  Output: unknown;
  Messages: { Tags: { name: string; value: string }[]; Data: string }[];
  Spawns: unknown[];
  Error?: string;
};

export type MyMessageResult<T> = MessageResult & {
  data: T;
  status?: "Success" | "Error";
};

export async function sendAndReceiveGameMessage<T>({
  tags,
  data,
  processId = ProcessId.TRENDS,
}: {
  tags: { name: string; value: string }[];
  data?: string;
  processId?: ProcessId;
}) {
  const action = tags.find((tag) => tag.name === "Action")?.value;
  console.log("sending message:" + action, { tags, data });
  const res = await message({
    process: processId,
    tags: tags,
    data: data,
    signer: createDataItemSigner(window.arweaveWallet),
  });
  const resultData = await result({
    message: res,
    process: processId,
  });

  console.log("got result: " + action, { resultData });
  return handleResultData<T>(resultData as MessageResult);
}

export async function sendDryRunGameMessage<T>({ tags, processId = ProcessId.TRENDS }: { tags: { name: string; value: string }[]; processId?: ProcessId }) {
  const action = tags.find((tag) => tag.name === "Action")?.value;
  console.log("sending dry run message:" + action, { tags });
  const resultData = await dryrun({
    process: processId,
    tags: tags,
    // signer: createDataItemSigner(window.arweaveWallet),
  });

  console.log("got result: " + action, { resultData });
  return handleResultData<T>(resultData as MessageResult);
}

function handleResultData<T>(resultData: MessageResult): MyMessageResult<T> {
  const newResultData = { ...resultData, data: {}, status: undefined } as MyMessageResult<T>;
  if (newResultData.Error) {
    throw new Error(newResultData.Error);
  }

  if (resultData.Messages?.length > 0) {
    const message = resultData.Messages[0];
    const tags = message.Tags;
    const status = tags.find((tag: { name: string; value: string }) => tag.name === "Status")?.value;
    let data = null;
    try {
      data = message.Data ? JSON.parse(message.Data) : {};
    } catch (e) {
      console.log("error parsing data", e);
    }

    newResultData.data = data as T;
    if (status) {
      newResultData.status = status as "Success" | "Error";
      if (status === "Success") {
        return newResultData;
      } else {
        const error = tags.find((tag: { name: string; value: string }) => tag.name === "Error")?.value;
        throw new Error(error);
      }
    }
  }
  return newResultData;
}

export async function pollForTransferSuccess(processId: ProcessId, onSuccessCheck: (messageTags: { name: string; value: string }[]) => boolean) {
  const url = `https://cu.ao-testnet.xyz/results/${processId}?sort=DESC`;

  try {
    let successFound = false;
    let attempts = 0;

    // Poll for a limited number of attempts (e.g., 10 attempts)
    while (!successFound && attempts < 10) {
      const response = await fetch(url);
      const result = await response.json();

      console.log("result", result);

      // Check if Transfer-Success message is in the result
      const transferSuccess = result.edges.find((edge: { node: { Messages: { Tags: { name: string; value: string }[] }[] } }) => {
        // Ensure that the edge has Messages and that Messages array is not empty
        if (edge.node.Messages && edge.node.Messages.length > 0) {
          for (const message of edge.node.Messages) {
            const messageTags = message.Tags;
            if (onSuccessCheck(messageTags)) {
              return true; // Found a successful message
            }
          }
          // return messageTags.some((tag: { name: string; value: string }) => tag.name === "Action" && tag.value === "Transfer-Success");
        }
        return false;
      });

      if (transferSuccess) {
        console.log("Transfer-Success message found:", transferSuccess);
        successFound = true;

        return true; // Success
      }

      // Wait for a few seconds before polling again
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 3 seconds
      attempts++;
    }

    return false; // Failed to find Transfer-Success message
  } catch (error) {
    console.error("Error polling Transfer-Success:", error);
    return false;
  }
}
