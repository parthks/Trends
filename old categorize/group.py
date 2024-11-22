
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
import numpy as np
import matplotlib.pyplot as plt


import json

# Load a pre-trained embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# import cleaned_tweets.json
with open('cleaned_tweets.json', 'r') as f:
    tweets = json.load(f)

texts = []

for tweet in tweets:
    # tweet['embedding'] = model.encode([tweet['text']])
    texts.append(tweet['text'])

print('encoding...')
embeddings = model.encode(texts)


'''
The Elbow Method helps you find the optimal number of clusters by minimizing the sum of squared distances between data points and their cluster centroids (inertia).
Look for an “elbow” point where the decrease in inertia slows significantly. This indicates the optimal number of clusters.
'''
def generateElbowPlot():
    # Run K-Means for different numbers of clusters
    inertia = []
    for k in range(1, 20):
        print('generating', k, 'clusters')
        kmeans = KMeans(n_clusters=k, random_state=0).fit(embeddings)
        inertia.append(kmeans.inertia_)

    # Plot the inertia values
    plt.plot(range(1, 20), inertia, marker='o')
    plt.xlabel('Number of Clusters (k)')
    plt.ylabel('Inertia')
    plt.title('Elbow Method to Determine Optimal Clusters')
    plt.show()

# # write data to a file
# with open('grouped_tweets.json', 'w') as f:
#     json.dump(data, f)


# Cluster tweets
num_clusters = 12  # Choose based on your dataset
kmeans = KMeans(n_clusters=num_clusters, random_state=0).fit(embeddings)

# Group tweets by cluster
clusters = {i: [] for i in range(num_clusters)}
for i, label in enumerate(kmeans.labels_):
    clusters[label].append(tweets[i])


# dump to file
with open('grouped_tweets.json', 'w') as f:
    json.dump(clusters, f)

# Print clusters
# for cluster_id, cluster_tweets in clusters.items():
#     print(f"Cluster {cluster_id}:")
#     for tweet in cluster_tweets:
#         print(f" - {tweet}")