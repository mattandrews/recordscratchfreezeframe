// Import the framework and instantiate it
import Fastify from 'fastify'
import fetch from 'node-fetch';
import ejs from 'ejs';

import fastifyStatic from "@fastify/static";
import path from 'node:path';

import fastifyView from '@fastify/view';
const __dirname = path.resolve();


const fastify = Fastify({
  logger: true
})

fastify.register(fastifyView, {
  engine: {
    ejs: ejs
  }
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
})


const convertAtProtocolToUri = data => {
  // from at://did:plc:o5exgt6gniampdauygxutzq7/app.bsky.feed.post/3ld65r5cm422v
  // to https://bsky.app/profile/viktorwinetrout.bsky.social/post/3ld65r5cm422v
  const atUri = data.uri;
  const atBits = atUri.split('/');
  const postId = atBits[atBits.length-1];
  const author = data.author.handle;
  const url = `https://bsky.app/profile/${author}/post/${postId}`;
  return url;
}


const cleanupPost = post => {
  return {
    url: convertAtProtocolToUri(post),
    username: post.author.handle,
    displayName: post.author.displayName,
    datePosted: post.record.createdAt,
    imageUrl: post.embed?.images?.[0].fullsize,
    status: post.record.text
  };
}


// Declare a route
fastify.get('/', async function handler (req, reply) {

  const response = await fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=you%27re%20probably%20wondering%20how%20i%20ended%20up%20in%20this%20situation');
  const data = await response.json();
  const parsedData = data.posts.map(item => cleanupPost(item)).filter(post => {
    return post.imageUrl
  });
  return reply.view("index.ejs", { posts: parsedData });
})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
