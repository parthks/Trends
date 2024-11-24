import json
import os
import time

from dotenv import load_dotenv
from openai import OpenAI

# 2 seconds for the OpenAI call

# Load environment variables
load_dotenv()

input_filename = 'bigData/tweets.json'
output_filename = 'bigData/categorized.json'

# Get API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OpenAI API key found. Please set OPENAI_API_KEY environment variable.")

client = OpenAI(api_key=OPENAI_API_KEY)



def saveToFile(tweets):
    with open(output_filename, 'w') as file:
        json.dump(tweets, file) 


def getTopic(tweet):
    response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": 'You are an advanced AI tasked with categorizing tweets into specific blockchain-related topics. Below is a list of categories to guide you, along with their descriptions. Your job is to analyze the content of the tweet and assign it to one or more categories from this list. If the tweet does not fit any category, label it as "Unknown"'
        },
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": '''Here is a tweet that needs to be categorized. Below is the list of categories with descriptions. Your task is to analyze the tweet and assign it to one or more categories.
    ### Categories
	1.	Ecosystem Projects – Tweets about blockchain projects, new launches, developer showcases, or innovative use cases.
	2.	Community Events – Announcements about meetups, conferences, webinars, AMAs, or hackathons.
	3.	Knowledge Sharing – Educational content, tutorials, best practices, or discussions to improve blockchain understanding.
	4.	Technical Innovations – Protocol updates, scalability solutions, or advancements in security and compliance.
	5.	Market and Adoption Trends – Insights into tokenomics, adoption growth, or real-world blockchain applications.
	6.	Developer Resources – Resources for developers, such as APIs, SDKs, grants, or open-source tools.
	7.	For Investors and Enthusiasts – Tweets focusing on token launches, staking guides, market insights, or investment opportunities.
	8.	For Enterprises – Content about enterprise blockchain adoption, integrations, or regulatory insights.
	9.	DAO Governance Updates – Updates about DAO proposals, voting, or how to participate in governance.
	10.	Community Stories – Highlights of user testimonials, community milestones, or contributor achievements.
	11.	Art and NFTs – Tweets featuring NFT collections, digital art trends, or gaming-related NFTs.
	12.	Gaming on Blockchain – Content about blockchain-based gaming, play-to-earn opportunities, or project updates.
	13.	Sustainability and Impact – Blockchain projects focused on environmental or social good initiatives.
	14.	Future of Blockchain – Predictions, thought leadership, or trends about the future of blockchain.
	15.	Education and Onboarding – Simplified guides for newcomers or ways to get involved in blockchain ecosystems.
	16.	Unknown – Use this if the tweet does not align with any of the above categories.

    ### Instructions

	1.	Read the tweet carefully.
	2.	Determine which category or categories the tweet fits into based on its content.
	3.	If it fits multiple categories, assign all relevant ones.
	4.	If the tweet does not fit any category, assign it to "Unknown"
	5.	Provide the final tag(s) with a short explanation of your choice(s) for validation.

    ### Response Format:
    {
        "tags": [<list of categories as strings>],
        "explanation": "<brief explanation for the chosen tags>"
    }

    ### Example Input:
    Tweet: “Join us at the #BlockchainSummit2024 to discuss the future of DAOs and meet blockchain innovators!”

    ### Example Output:
    {
        "tags": ["Community Events", "Future of Blockchain"],
        "explanation": "The tweet promotes a blockchain summit (Community Events) and mentions discussions on the future of DAOs (Future of Blockchain)."
    }
    Your Turn:'''+json.dumps(tweet)
    }]},
    ],
    temperature=0.1,
    max_tokens=500,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "categorization",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of categories that the tweet falls under. Must be one or more of the categories listed above."
                },
                "explanation": {
                    "type": "string",
                    "description": "Brief explanation of why the tags were chosen."
                }
            },
            "required": ["tags", "explanation"],
            "additionalProperties": False
        }
    }})
    return response.choices[0].message.content


topics = [
"Ecosystem Projects",
"Community Events",
"Knowledge Sharing",
"Technical Innovations",
"Market and Adoption Trends",
"Developer Resources",
"For Investors and Enthusiasts",
"For Enterprises",
"DAO Governance Updates",
"Community Stories",
"Art and NFTs",
"Gaming on Blockchain",
"Sustainability and Impact",
"Future of Blockchain",
"Education and Onboarding",
"Unknown",
]


# import tweets.json
with open(input_filename, 'r') as file:
    tweets = json.load(file)

categorized_tweets = []
try:
    with open(output_filename, 'r') as file:
        categorized_tweets = json.load(file)
except:
    pass

count = 0
for tweet in tweets:
    count += 1
    # if tweet in categorized_tweets skip
    if any(t['id'] == tweet['id'] for t in categorized_tweets):
        # print(f"Tweet {tweet['id']} already processed, skipping...")
        continue
    tags_data = json.loads(getTopic(tweet))
    tags = tags_data['tags']
    # remove tags that are not in topics
    tags = [tag for tag in tags if tag in topics]
    tweet['tags'] = tags
    tweet['explanation'] = tags_data['explanation']
    categorized_tweets.append(tweet) 
    if count % 10 == 0:
        saveToFile(categorized_tweets) 
    print(count, tweet['tags'])
    # Check each tag individually
    for tag in tweet['tags']:
        if tag not in topics:
            print(f"Topic '{tag}' not in allowed topics list")
            raise Exception(f"Topic '{tag}' not in allowed topics list")

saveToFile(categorized_tweets) 
# show counts of each tag from tags of categorized_tweets

# Count and display tag frequencies
tag_counts = {}
for tweet in categorized_tweets:
    for tag in tweet['tags']:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1

# Sort tags by count in descending order
sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)

# Print the results
print("\nTag Distribution:")
print("-" * 40)
for tag, count in sorted_tags:
    print(f"{tag}: {count}")
