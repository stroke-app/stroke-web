// Tell Bing, Yandex and the other IndexNow engines (Bing's index feeds
// ChatGPT search and Copilot) that every page in the sitemap may have
// changed. Runs after each deploy; the key file sits in public/.
const HOST = "stroke.click";
const KEY = "11929e7c0759f53b4d7824e5ef6249a1";

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});
console.log(`IndexNow: ${urlList.length} URLs, ${res.status}`);
