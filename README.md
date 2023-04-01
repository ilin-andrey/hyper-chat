## Intro

This source code and application itself is a solution for the given task on the tech interview for the frontend engineer position.

Task definition:

- create a simple chat application with fake API to generate big amount of messages
- load old messages when scroll to top
- new message should be added to the bottom
- each message in the chat can be random length and has random size
- need to limit number of messages in the DOM tree at the same time
- chat have to support big amount of messages at the same time (> 100000)
- at the same time each loaded message must be available for navigation
- size of the container can't be decreased if message was unloaded from DOM tree
- usage of 3rd party packages is prohibited, functionality of `virtualization` and data loading must be implemented from scratch
- keep code clean

The main idea behind this task is to show understanding of the React rendering pipeline and understanding of `virtualization` algorithms for huge amount of random data loaded to the DOM tree.

[Demo](https://hyper-chat-kappa.vercel.app/)

## Getting Started

To run it locally, first install all required dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech stack

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Next.js](https://nextjs.org)
- [tailwindcss](https://tailwindcss.com/)
- [SWR](https://swr.vercel.app/)
