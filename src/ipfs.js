// ipfs.js
export async function uploadFileToPinata(file) {
  const PINATA_API_KEY = "749ed56586b880eb0de6";
  const PINATA_API_SECRET =
    "bc68ce9b6d174ec9b9908a71289d4e4a3195aa5fa8840f549a469fc765a94881";
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
    body: formData,
  });

  const data = await res.json();
  if (!data.IpfsHash) throw new Error("Pinata upload failed");
  return data.IpfsHash;
}
