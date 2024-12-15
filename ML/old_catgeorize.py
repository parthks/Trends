import requests
import json
import ollama
import time
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OpenAI API key found. Please set OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=OPENAI_API_KEY)

def makePrompt(tweet):
    return f'''
    Task: Categorize the following tweet into one of the provided topics based on its content.

                Instructions:
                    1.	Read the tweet carefully and identify the key concepts, technologies, and themes discussed in the tweet.
                    2.	Match the tweet to one of the following topics, based on the most relevant aspects of its content. The categories are related to the development of the AO (Arweave Compute) ecosystem and technologies.
                
                Topics:
                1.	AO Development and Core Technologies: This category includes tweets that discuss technical updates, innovations, and milestones related to the AO ecosystem. Focus is on things like new SDKs, improvements in scalability, hyper-parallel computing, message-passing architecture, holographic state, or support for virtual machines (e.g., WASM/EVM/SVM).
                2.	Ecosystem Growth and New Projects: This category includes tweets that highlight new projects, applications, or use cases being developed on AO. It can also include mentions of decentralized finance (DeFi) platforms like DEXs or stablecoins, gaming applications, AI tools, and developer-focused projects. Tweets should emphasize the expansion of the AO ecosystem.
                3.	Integration of AI and Decentralized Applications: Tweets in this category should focus on the integration of AI with decentralized technologies, particularly applications powered by AI that are built on or integrated with the AO ecosystem. For example, on-chain AI training, AI agents for trading, or decentralized AI applications.
                4.	Arweave as a Data Layer for Web3: Tweets that emphasize Arweave’s role as a permanent, scalable data layer for Web3 applications belong in this category. This includes technical discussions about how Arweave is used to store data permanently, how it supports Web3 ecosystems, and any related advancements.
                5.	Permanent Storage and Accessibility: This category covers Arweave’s core feature of permanent storage, as well as updates to tools that enhance the accessibility and user experience of storing data on Arweave. Mentions of ArDrive, ArConnect, or any other tools that improve access to Arweave’s permanent storage are relevant here.
                6.	Cross-Chain Interoperability: Tweets that discuss how AO or Arweave integrates with or connects to other blockchains (e.g., Ethereum, USDC, or DAI) through bridges or cross-chain technologies should be categorized here. The focus is on enabling cross-chain asset transfers or interoperability.
                7.	Tokenomics and Governance: This category includes tweets discussing the tokenomics of $AO, such as minting rewards, token distribution, deflationary mechanisms, or any governance structures within the AO ecosystem (like DAO models).
                8.	Community and Events: Tweets in this category highlight the community aspect of the AO ecosystem, such as meetups, workshops, hackathons, or general community engagement. Focus is on how people are coming together around the ecosystem, how the community is growing, and events that foster collaboration.

                Tweet to categorize:
                {tweet}
                
                Approach:
                    •	Identify if the tweet focuses on any specific technological advancements (e.g., SDKs, scalability) or the use of Arweave as a core infrastructure for Web3.
                    •	Determine if the tweet is about a new project or ecosystem use case (e.g., DEXs, DeFi, gaming).
                    •	Look for mentions of AI-related integrations or applications built on AO/Arweave.
                    •	Assess if the content is more about Arweave’s role in providing permanent data storage or accessibility features.
                    •	If the tweet is talking about interoperability between blockchains, consider if the focus is on cross-chain bridges or connections.
                    •	Consider whether the tweet talks about $AO tokenomics or governance models.
                    •	If the tweet discusses events, community activities, or engagement, categorize it under community-focused topics.

                Output: Choose the topic that most accurately represents the main focus of the tweet based on the instructions above. Do not output an explanation. Just output the topic name only in plain text. 
                Topic names are: AO Development and Core Technologies, Ecosystem Growth and New Projects, Integration of AI and Decentralized Applications, Arweave as a Data Layer for Web3, Permanent Storage and Accessibility, Cross-Chain Interoperability, Tokenomics and Governance, Community and Events
                
'''

topics = [
    'AO Development and Core Technologies',
    'Ecosystem Projects',
    'Integration of AI and Decentralized Applications',
    'Arweave as a Data Layer for Web3',
    'Permanent Storage and Accessibility',
    'Cross-Chain Interoperability',
    'Knowledge Sharing',
    'Tokenomics and Governance',
    'Community & Events'
]


def saveToFile(tweets):
    with open('identified_tweets.json', 'w') as file:
        json.dump(tweets, file) 

def getTopicOLamma(tweet):
    response = ollama.chat(
    model='llama3.2',
    messages=[{
        'role': 'user',
        'content': makePrompt(json.dumps(tweet)) #initial_prompt + prompt,
    }]
    )
    topic = response['message']['content']
    return topic


def getTopic(tweet):
    response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": f'''Task: Categorize the following tweet into one of the provided topics based on its content.\n\n                Instructions:\n                    1.\tRead the tweet carefully and identify the key concepts, technologies, and themes discussed in the tweet.\n                    2.\tMatch the tweet to one of the following topics, based on the most relevant aspects of its content. The categories are related to the development of the AO (Arweave Compute) ecosystem and technologies.\n                \n                Topics:\n                1.\tAO Development and Core Technologies: This category includes tweets that discuss technical updates, innovations, and milestones related to the AO ecosystem. Focus is on things like new SDKs, improvements in scalability, hyper-parallel computing, message-passing architecture, holographic state, or support for virtual machines (e.g., WASM/EVM/SVM).\n                2.\tEcosystem Growth and New Projects: This category includes tweets that highlight new projects, applications, or use cases being developed on AO. It can also include mentions of decentralized finance (DeFi) platforms like DEXs or stablecoins, gaming applications, AI tools, and developer-focused projects. Tweets should emphasize the expansion of the AO ecosystem.\n                3.\tIntegration of AI and Decentralized Applications: Tweets in this category should focus on the integration of AI with decentralized technologies, particularly applications powered by AI that are built on or integrated with the AO ecosystem. For example, on-chain AI training, AI agents for trading, or decentralized AI applications.\n                4.\tArweave as a Data Layer for Web3: Tweets that emphasize Arweave’s role as a permanent, scalable data layer for Web3 applications belong in this category. This includes technical discussions about how Arweave is used to store data permanently, how it supports Web3 ecosystems, and any related advancements.\n                5.\tPermanent Storage and Accessibility: This category covers Arweave’s core feature of permanent storage, as well as updates to tools that enhance the accessibility and user experience of storing data on Arweave. Mentions of ArDrive, ArConnect, or any other tools that improve access to Arweave’s permanent storage are relevant here.\n                6.\tCross-Chain Interoperability: Tweets that discuss how AO or Arweave integrates with or connects to other blockchains (e.g., Ethereum, USDC, or DAI) through bridges or cross-chain technologies should be categorized here. The focus is on enabling cross-chain asset transfers or interoperability.\n                7.\tTokenomics and Governance: This category includes tweets discussing the tokenomics of $AO, such as minting rewards, token distribution, deflationary mechanisms, or any governance structures within the AO ecosystem (like DAO models).\n                8.\tCommunity and Events: Tweets in this category highlight the community aspect of the AO ecosystem, such as meetups, workshops, hackathons, or general community engagement. Focus is on how people are coming together around the ecosystem, how the community is growing, and events that foster collaboration.\n\n Tweet to categorize:\n{tweet} \n\nOutput: Choose the topic that most accurately represents the main focus of the tweet based on the instructions above. Output only the topic name"'''
            }
        ]
        },
        {
        "role": "assistant",
        "content": [
            {
            "type": "text",
            "text": "Community and Events"
            }
        ]
        }
    ],
    temperature=1,
    max_tokens=2048,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    response_format={
            "type": "text"
        }
    )
    return response.choices[0].message.content

# import tweets.json
with open('tweets.json', 'r') as file:
    tweets = json.load(file)

identified_tweets = []
with open('identified_tweets.json', 'r') as file:
    identified_tweets = json.load(file)

for tweet in tweets:
    # if tweet in identified_tweets skip
    if any(t['id'] == tweet['id'] for t in identified_tweets):
        # print(f"Tweet {tweet['id']} already processed, skipping...")
        continue
    time.sleep(1)
    retries = 3
    while retries > 0:  
        try:
            topic = getTopic(tweet)
            tweet['topic'] = topic
            identified_tweets.append(tweet) 
            saveToFile(identified_tweets) 
            print(topic)
            if topic not in topics:
                # print(tweet)
                print(f"Topic {topic} not in topics")
                raise Exception(f"Topic {topic} not in topics")
            break
        except Exception as e:
            print(f"Error: {e}")
            retries -= 1
            if retries == 0:
                print(tweet)
                print(f"Failed to get topic for tweet {tweet['id']}")
                raise e
    
    

# show counts of topics from identified_tweets

counts = {}
community_tweets = []
for tweet in identified_tweets:
    topic = tweet['topic']
    if (topic == "Community and Events"):
        community_tweets.append(tweet)
    counts[topic] = counts.get(topic, 0) + 1

# Print the counts
for topic, count in counts.items():
    print(f"{topic}: {count}")

# save community_tweets to file
with open('community_tweets.json', 'w') as file:
    json.dump(community_tweets, file)
