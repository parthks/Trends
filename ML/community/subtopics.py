import json
import os
from dotenv import load_dotenv
from openai import OpenAI

# Find project root directory (where .env is located)
current_dir = os.path.dirname(__file__)  # community/
project_root = os.path.dirname(current_dir)  # gets parent directory
env_path = os.path.join(project_root, ".env")
print(f"Looking for .env file at: {env_path}")
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key found: {'Yes' if api_key else 'No'}")
# Get API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("No OpenAI API key found. Please set OPENAI_API_KEY environment variable.")

client = OpenAI()



def getTopic(tweet):
    response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": f'''You are an AI tasked with categorizing tweets related to the Arweave and AO ecosystem into predefined categories and generating relevant tags. Carefully analyze the tweet’s content and context to:\n1. Assign it to the most appropriate category.\n2. Add one or more tags that can later be used to group topics, regions, or other recurring themes.\n\nCategories:\n\n1. Hackathons: Tweets about hackathon events such as PermaHacks, Arweave Fullstack Hack, AO Game Jam, or similar. May include details about participation, prizes, or event outcomes.\n2. Conferences and Summits: Tweets about high-level events like Arweave Day Berlin, AO Summit Charleston, Arweave Asia 2024, or other summits focusing on talks, networking, and ecosystem discussions.\n3. Meetups and Workshops: Tweets about smaller, focused events like community meetups, workshops (e.g., AO Workshop Hangzhou), or bootcamps designed for learning and collaboration.\n4. Demo Days: Tweets highlighting demo days where projects showcase their work, such as AO Ventures Demo Day or Arweave India Demo Day.\n5. Regional Highlights: Tweets specifically about events in particular regions, such as Arweave India, Arweave Asia, or other localized initiatives.\n6. Community Engagement: Tweets focusing on milestones, growth metrics, or general community involvement, such as new followers, Discord members, or user engagement campaigns.\n7. Ecosystem Updates: Tweets about project launches, partnerships, funding announcements, or bounties, including mentions of specific projects (e.g., Typr, Gather Chat).\n8. Knowledge Sharing: Tweets about technical discussions, podcasts, or educational content like tutorials, coding deep dives, or seminars.\n9. Other: Tweets that do not clearly belong to any of the above categories.\n\nTask:\n\n1. Categorize the tweet into one of the above categories.\n2. Generate relevant tags:\n• Topic Tags: Keywords that describe the main topic (e.g., “hackathons,” “workshops,” “funding”).\n• Geo Tags: Locations or regions mentioned (e.g., “Singapore,” “India,” “Denver”).\n• Other Tags: Projects, technologies, or recurring terms in the tweet (e.g., “Permahacks,” “Arweave Asia”, \"Hacker Hangouts\" ).\n\nTweet\n"{tweet}'''
            }
        ]
        },
    ],
    temperature=0.8,
    max_tokens=2048,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    response_format={
        "type": "json_schema",
        "json_schema": {
        "name": "categorization",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
            "category": {
                "type": "string",
                "description": "The category of the event."
            },
            "tags": {
                "type": "object",
                "properties": {
                "topic_tags": {
                    "type": "array",
                    "description": "Tags related to the topics of the event.",
                    "items": {
                    "type": "string"
                    }
                },
                "geo_tags": {
                    "type": "array",
                    "description": "Geographical tags related to the event. Add only country names.",
                    "items": {
                    "type": "string"
                    }
                },
                "other_tags": {
                    "type": "array",
                    "description": "Other miscellaneous tags related to the event.",
                    "items": {
                    "type": "string"
                    }
                }
                },
                "required": [
                "topic_tags",
                "geo_tags",
                "other_tags"
                ],
                "additionalProperties": False
            }
            },
            "required": [
            "category",
            "tags"
            ],
            "additionalProperties": False
        }
        }
    }
    )
    return response.choices[0].message.content


def saveToFile(tweets):
    with open('community_tweets.json', 'w') as file:
        json.dump(tweets, file) 


# import community_tweets.json
with open('community_tweets.json', 'r') as file:
    community_tweets = json.load(file)

for tweet in community_tweets:
    if ('category' in tweet):
        continue
    topic = json.loads(getTopic(tweet))
    print(topic, '\n')
    category = topic['category']
    tags = topic['tags']
    tweet['category'] = category
    tweet['tags'] = tags
    tweet['all_tags'] = tags['topic_tags'] + tags['geo_tags'] + tags['other_tags']

    saveToFile(community_tweets)


# find stat counts of categories and tags for each category

# Calculate statistics for categories and tags
category_counts = {}
tag_counts_by_category = {}
overall_tag_counts = {
    'topic_tags': {},
    'geo_tags': {},
    'other_tags': {}
}

for tweet in community_tweets:
    category = tweet.get('category')
    if category:
        # Count categories
        category_counts[category] = category_counts.get(category, 0) + 1
        
        # Initialize tag counts for this category if not exists
        if category not in tag_counts_by_category:
            tag_counts_by_category[category] = {
                'topic_tags': {},
                'geo_tags': {},
                'other_tags': {}
            }
        
        # Count tags by type for each category
        tags = tweet.get('tags', {})
        for tag_type in ['topic_tags', 'geo_tags', 'other_tags']:
            for tag in tags.get(tag_type, []):
                # Count for category
                tag_counts_by_category[category][tag_type][tag] = \
                    tag_counts_by_category[category][tag_type].get(tag, 0) + 1
                # Count for overall
                overall_tag_counts[tag_type][tag] = \
                    overall_tag_counts[tag_type].get(tag, 0) + 1

# Print category statistics
# print("\nCategory Statistics:")
# print("-" * 50)
# for category, count in sorted(category_counts.items()):
#     print(f"{category}: {count} tweets")
#     print("Top tags in this category by type:")
#     if category in tag_counts_by_category:
#         for tag_type in ['topic_tags', 'geo_tags', 'other_tags']:
#             print(f"  {tag_type.replace('_', ' ').title()}:")
#             sorted_tags = sorted(
#                 tag_counts_by_category[category][tag_type].items(), 
#                 key=lambda x: x[1], 
#                 reverse=True
#             )[:5]
#             for tag, tag_count in sorted_tags:
#                 print(f"    - {tag}: {tag_count}")
#     print()

# Print overall tag statistics
print("\nOverall Tag Statistics:")
print("-" * 50)
for tag_type in ['topic_tags', 'geo_tags', 'other_tags']:
    if (tag_type == "topic_tags"):
        print(f"\n{tag_type.replace('_', ' ').title()}:")
        sorted_tags = sorted(
            overall_tag_counts[tag_type].items(),
            key=lambda x: x[1],
            reverse=True
        )  # Show top 10 overall
        for tag, count in sorted_tags:
            print(f"  - {tag}: {count}")