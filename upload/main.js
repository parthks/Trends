import Irys from '@irys/sdk';
import fs from 'fs';

// wallet p-OexRBIXIXdql9Amlqtnlh4p57KBiNu6NJmD4gyISc

/*
Tags inspired by Application: TwittAR (and Application: ARticle)
https://github.com/Irys-xyz/ARchivers
*/

const input_file = "categorized.json"
const categorized = JSON.parse(fs.readFileSync(input_file, 'utf8'));

const tweets_file = "sam.json"
const tweets = JSON.parse(fs.readFileSync(tweets_file, 'utf8'));

const getIrys = async () => {
  const network = 'mainnet'; // Use 'mainnet' for production
  const token = 'arweave';
  const key = JSON.parse(fs.readFileSync('wallet.json', 'utf8'));
  const irys = new Irys({
    network,
    token,
    key,
  });
  return irys;
};

const uploadDataWithTags = async (tweet, categories) => {
  const tags = [
    { name: 'Application', value: 'Test' }, 
    { name: 'Version', value: '1' },
    { name: 'Content-Type', value: 'application/json' }, 
    { name: 'Tweet-ID', value: tweet.id },
    { name: 'Author-ID', value: tweet.author.id },
    { name: 'Author-Handle', value: tweet.author.userName },
    { name: 'Created-At', value: new Date(tweet.createdAt).getTime().toString() },
  ]
  for (const tag of categories) {
    tags.push({ name: 'Topic', value: tag });
  }

  if (tweet.isRetweet) {
    tags.push({ name: 'isRetweet', value: "true" });
    tags.push({ name: 'Retweet-ID', value: tweet.retweet.id });
    tags.push({ name: 'Retweet-Author-ID', value: tweet.retweet.author.id });
    tags.push({ name: 'Retweet-Author-Handle', value: tweet.retweet.author.userName });
  } else {
    tags.push({ name: 'isRetweet', value: "false" });
  }

  if (tweet.isQuote) {
    tags.push({ name: 'isQuote', value: "true" });
    tags.push({ name: 'Quote-ID', value: tweet.quote.id });
    tags.push({ name: 'Quote-Author-ID', value: tweet.quote.author.id });
    tags.push({ name: 'Quote-Author-Handle', value: tweet.quote.author.userName });
  } else {
    tags.push({ name: 'isQuote', value: "false" });
  }

  const irys = await getIrys();
  const dataToUpload = JSON.stringify(tweet);
  try {
    const receipt = await irys.upload(dataToUpload, { tags });
    console.log(`Data uploaded: https://arweave.net/${receipt.id}`);
  } catch (e) {
    console.error('Error uploading data with tags:', e);
  }
};

const saveToFile = (data) => {
  fs.writeFileSync('done_tweet_ids.json', JSON.stringify(data, null, 2));
}

let count = 0;
const done_tweet_ids = JSON.parse(fs.readFileSync('done_tweet_ids.json', 'utf8')) || [];

async function main() {
  for (const tweet of tweets) {
    count++;
    if (done_tweet_ids.includes(tweet.id)) {
    continue;
  }
    const categories = categorized.find(c => c.id === tweet.id)?.tags || [];
    try {
      await uploadDataWithTags(tweet, categories);
    } catch (e) {
      console.error(`Error uploading tweet ${tweet.id}: ${e.message}`);
    }
    // sleep
    await new Promise(resolve => setTimeout(resolve, 3000));
    done_tweet_ids.push(tweet.id);
    saveToFile(done_tweet_ids);
    count++;
    if (count > 10) {
    console.log(`Done ${count} tweets`);
    saveToFile(done_tweet_ids);
    throw new Error("Stop here");
    }
  }
}

main();

