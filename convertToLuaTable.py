
'''
# lua table format:
["2024-11-18"] = {
        tweets = {
            {
                id = "1858573102713573856",
                handle = "samecwilliams",
            }
        },
        summary =
        "A new supercomputer, developed by @aoTheComputer, is making dreams possible within the blockchain ecosystem. This advancement highlights significant technical innovations, particularly in enhancing computational capabilities. For more details, you can view the tweet [here](https://twitter.com/basejumpxyz/status/1858566615282901195)."
    }

# summary format
"2024-11-19": {
    "tweets": [
    {
        "id": "1858701455500230918",
        "user": "samecwilliams",
        "retweet": "New VM integration unlocked \ud83d\udd11\n\nIt's now possible to deploy a WeaveVM L2 that uses the SVM for computation and WeaveVM for data settlement, with a direct data pipeline to Arweave\u2019s permanent storage and out-of-the-box support to deploy Solana dApps.\n\nhttps://blog.wvm.dev/weave-svm/ https://t.co/5Axj4oy4gn",
        "retweetUser": "weavevm",
        "createdAt": "Tue Nov 19 02:38:54 +0000 2024",
        "tags": ["Technical Innovations", "Ecosystem Projects"],
        "explanation": "The tweet discusses a new VM integration that allows for deploying a WeaveVM L2 using SVM for computation, which is a technical advancement (Technical Innovations). It also highlights the capability to deploy Solana dApps, indicating a new project within the blockchain ecosystem (Ecosystem Projects).",
        "likeCount": 49
    },
    ],
    "summary": "A new VM integration has been announced, enabling the deployment of a WeaveVM L2 that utilizes SVM for computation and WeaveVM for data settlement. This integration provides a direct data pipeline to Arweave's permanent storage and supports the deployment of Solana dApps. For more details, you can read the full announcement [here](https://blog.wvm.dev/weave-svm/).\n\nAdditionally, a new feature allows users to host their INSERT_CHAIN app on Arweave with just one click. This feature automatically assigns a human-readable domain that is resolvable across approximately 250 Arweave gateways, marking a significant step towards a decentralized front-end future."
},
'''

import json

topics = {
"Ecosystem Projects": "This category highlights projects within the blockchain ecosystem, from newly launched initiatives to established platforms innovating in the space. Users can expect updates on cutting-edge technologies, inspiring use cases, and detailed developer showcases. Whether it’s a new decentralized app, a groundbreaking protocol, or a novel use of blockchain, this section offers insights into the dynamic projects shaping the industry.",
"Community Events": "Community Events focus on gatherings, both virtual and in-person, that bring blockchain enthusiasts together. From global conferences and hackathons to intimate webinars and community-driven meetups, this category provides updates on where and how to connect with like-minded individuals. Users can expect announcements about key events, opportunities to participate, and insights into past happenings.",
"Knowledge Sharing": "This category is all about learning and growth. It features tutorials, educational content, and best practices aimed at helping users understand blockchain technology better. Whether you’re a beginner exploring blockchain for the first time or an expert looking to refine your skills, this section offers valuable resources and discussions that deepen your knowledge.",
"Technical Innovations": "Technical Innovations dives into the advancements and breakthroughs in blockchain technology. It covers topics like protocol updates, scalability solutions, security enhancements, and compliance innovations. Users should expect detailed explanations of technical progress and its implications for the broader ecosystem, offering a glimpse into the cutting edge of blockchain.",
"Market and Adoption Trends": "This category tracks the pulse of the blockchain market, including tokenomics, ecosystem growth, and real-world applications. Users can expect analysis of adoption trends, insights into how blockchain is being used across industries, and updates on the overall health and trajectory of the market. It’s ideal for staying informed about where blockchain is heading.",
"Developer Resources": "Developer Resources is a hub for tools and support tailored to blockchain builders. This category includes APIs, SDKs, open-source projects, and funding opportunities like grants. Users can expect to find everything they need to start or enhance their blockchain development journey, along with tips and guidance from the community.",
"For Investors and Enthusiasts": "This section caters to those interested in the financial and strategic aspects of blockchain. It covers token launches, staking guides, and investment opportunities, alongside market analysis to help users make informed decisions. Enthusiasts can also find updates on projects that are gaining traction and could be worth watching.",
"For Enterprises": "For Enterprises focuses on how blockchain is transforming businesses. It includes case studies of successful implementations, insights into enterprise integrations, and regulatory updates relevant to businesses exploring blockchain. Users can expect to learn how companies are leveraging blockchain to innovate and solve complex challenges.",
"DAO Governance Updates": "This category centers on the evolving world of decentralized autonomous organizations (DAOs). It includes updates on governance proposals, voting processes, and insights into how DAOs are shaping decision-making in blockchain ecosystems. Users should expect guidance on participating in DAOs and highlights of active, impactful organizations.",
"Community Stories": "Community Stories celebrate the people and achievements within the blockchain ecosystem. This category features user testimonials, milestones, and inspirational accounts of contributors making a difference. Users can expect uplifting narratives that showcase the human side of blockchain.",
"Art and NFTs": "Art and NFTs explore the intersection of blockchain and creativity. This category highlights innovative NFT collections, trends in digital art, and collaborations across industries like gaming and the metaverse. Users can expect to discover unique art pieces, insights into the NFT market, and ways blockchain is redefining creative ownership.",
"Gaming on Blockchain": "This section is dedicated to blockchain-based gaming, with a focus on play-to-earn opportunities, project updates, and reviews of popular blockchain games. Users can expect insights into the latest gaming technologies and trends, along with guides to maximize their gaming experience in the blockchain space.",
"Sustainability and Impact": "Sustainability and Impact cover projects leveraging blockchain for environmental and social good. This category highlights green initiatives, charitable efforts, and discussions about blockchain’s potential to drive sustainable development. Users can expect thought-provoking content on how the technology can contribute to a better world.",
"Future of Blockchain": "This forward-looking category explores predictions, trends, and visionary ideas about blockchain’s evolution. It features interviews with thought leaders, discussions about emerging technologies, and insights into the potential of cross-chain and multi-chain ecosystems. Users can expect thought-provoking content that sparks imagination about blockchain’s possibilities.",
"Education and Onboarding": "Education and Onboarding is designed for newcomers and those looking to deepen their understanding of blockchain. It offers simplified guides, beginner-friendly resources, and step-by-step instructions for getting started in the ecosystem. Users can expect accessible, jargon-free content that helps them navigate the blockchain world with ease.",
"Unknown": "This category captures content that doesn’t fit into the predefined topics but might still be relevant or interesting. Users should expect miscellaneous updates, unexpected insights, or outlier discussions that defy categorization but add value to the overall blockchain narrative.",
}

tweets_by_tag_and_day = {}
lua_table = {}
lua_table_text = "DATA = {\n"
with open('summary.json', 'r') as file:
    tweets_by_tag_and_day = json.load(file)

for tag, days in tweets_by_tag_and_day.items():
    lua_table[tag] = {"name": tag, "slug": tag.replace(" ", "-").lower(), "description": topics[tag], "followers": {}, "upvotes": {}, "comments": {}, "total_followers": 0, "total_upvotes": 0, "byDay": {}, "num_updates": len(days.keys()), "last_updated": list(days.keys())[-1]}
    lua_table_text += f'["{tag}"] = {{\nname = "{tag}",\nslug = "{tag.replace(" ", "-").lower()}",\ndescription = "{topics[tag]}",\nfollowers = {{}},\nupvotes = {{}},\ncomments = {{}},\ntotal_followers = 0,\ntotal_upvotes = 0,\nnum_updates = {len(days.keys())},\nlast_updated = "{list(days.keys())[0]}",\nbyDay = {{\n'
    for day, tweets in days.items():
        lua_table[tag]["byDay"][day] = {}
        lua_table[tag]["byDay"][day]["tweets"] = []
        lua_table[tag]["byDay"][day]["summary"] = tweets["summary"]
        lua_table[tag]["byDay"][day]["upvotes"] = {}
        lua_table[tag]["byDay"][day]["total_upvotes"] = 0
        lua_table_text += f'["{day}"] = {{summary = [[{tweets["summary"]}]],\nupvotes = {{}},\ntotal_upvotes = 0,\ntweets = {{\n'
        for tweet in tweets["tweets"]:
            lua_table[tag]["byDay"][day]["tweets"].append({
                "id": tweet["id"],
                "handle": tweet["user"],
            })
            lua_table_text += f'{{id = "{tweet["id"]}", handle = "{tweet["user"]}"}},\n'
        lua_table_text += "},\n"
        lua_table_text += "},\n"
    lua_table_text += "}},\n"

# save to file
with open('trends_data.json', 'w') as file:
    file.write(json.dumps(lua_table))

lua_table_text += "\n}"
with open('backend/trends_data.lua', 'w') as file:
    file.write(lua_table_text)
