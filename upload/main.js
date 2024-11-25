import Irys from '@irys/sdk';
import fs from 'fs';

// wallet p-OexRBIXIXdql9Amlqtnlh4p57KBiNu6NJmD4gyISc

/*
Tags inspired by Application: TwittAR (and Application: ARticle)
https://github.com/Irys-xyz/ARchivers
*/

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

const uploadDataWithTags = async () => {
  const irys = await getIrys();
  const dataToUpload = 'Hello, Arweave with tags!';
  const tags = [
    { name: 'Application', value: 'Test' }, 
    { name: 'Version', value: '1' },
    { name: 'Tags-Array', value: "['Test', 'Test2']" },
    { name: 'Tags', value: 'Test1' },
    { name: 'Tags', value: 'Test2' },
    { name: 'Content-Type', value: 'application/json' }, 
    { name: 'Tweet-ID', value: '1234567890' },
    { name: 'Author-ID', value: '409642632' },
    { name: 'Author-Handle', value: '@satoshi' },
    { name: 'Created-At', value: '1731983934000' },
  ];
  try {
    const receipt = await irys.upload(dataToUpload, { tags });
    console.log(`Data uploaded: https://arweave.net/${receipt.id}`);
  } catch (e) {
    console.error('Error uploading data with tags:', e);
  }
};

uploadDataWithTags();