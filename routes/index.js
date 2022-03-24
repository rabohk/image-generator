var express = require('express');
var path = require('path');
const puppeteer = require("puppeteer");
const fs = require("fs");
var router = express.Router();

const HTML_TEMPLATE = fs.readFileSync(__dirname + "/template.html", "utf8");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function generateImage(params) {
  try {
    console.log("generating image for " + params.ssrId);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 500 });
    await page.setContent(
      HTML_TEMPLATE.replace("<%-HTML_CONTENT%>", params.ssr)
    );
    // await page.goto(`data:text/html,${contentHtml}`, {
    //   waitUntil: "networkidle0",
    // });

    // await delay(4000);
    await page.screenshot({ path: `public/images/${params.ssrId}.jpeg` });
    await browser.close();
    console.log("done");
  } catch (error) {
    console.error(error);
  }
}

router.post("/getImageUrlFromHtml", (req, res) => {
  var params = req.body;
  if (!params.ssrId || !params.ssr) {
    res.sendStatus(400);
    return;
  }
  console.log("got " + JSON.stringify(params.ssrId));
  generateImage(params);
  var fullUrl = req.protocol + "://" + req.get("host");
  var path = `${fullUrl}/image/${params.ssrId}.jpeg`;
  res.json({ ssrId: params.ssrId, imageUrl: path });
});

router.get("/image/:id", (req, res, next) => {
  res.set('Cache-Control', 'max-age=1000000');
  res.sendFile(path.join(__dirname, `../public/images/${req.params.id}`));
});

module.exports = router;
