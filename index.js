const puppeteer = require("puppeteer");
const download = require("image-downloader");

class Scrapper {
   constructor() {
      this.imageDirectory = "../../images";
      this.imagesDownloaded = 0;
      this.currentId = 1;
      this.endingId = 1444;
      this.startTime = performance.now();
      this.browserConfig = {
         headless: true,
         defaultViewport: null,
         executablePath:
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
         args: [],
      };
   }

   run = async () => {
      this.browser = await puppeteer.launch(this.browserConfig);
      this.page = await this.browser.newPage();

      while (this.currentId <= this.endingId) {
         await this.scrapeMonsterPage(this.currentId);
         this.currentId += 1;
      }

      const endTime = performance.now();
      console.log(
         `Downloaded ${this.imagesDownloaded} out of ${this.currentId} pages`
      );
      console.log(
         `Total processing time: ${(endTime - this.startTime) / 1000} seconds`
      );


      this.page.close();
      this.browser.close();
      return;
   };

   scrapeMonsterPage = async (id) => {
      const titleXpath = '//*[@id="ctl00_RadDrawer1_Content_MainContent_DetailedOutput"]/h1[2]/a';
      const imageSelector = ".thumbnail";
      await this.page.goto(`https://2e.aonprd.com/Monsters.aspx?ID=${id}`);

      try {
         await this.page.waitForXPath(titleXpath, { timeout: 5000 });
      } catch {
         console.log(`> No selector for id ${this.currentId}`);
         return;
      }

      let element = await this.page.$x(titleXpath);
      element = element.length ? element[0] : element;
      let monsterTitle = await this.page.evaluate(
         (el) => el.textContent,
         element
      );

      element = await this.page.$(imageSelector);
      let monsterImageUrl = undefined;
      if (element) {
         monsterImageUrl = await this.page.evaluate((el) => el.src, element);
      }

      console.log(
         `> ${this.currentId}/${this.endingId} - ${monsterTitle} --- ${
            monsterImageUrl ? "Image found!" : "No image found..."
         }`
      );

      if (monsterTitle && monsterImageUrl) {
         await this.downloadImage(monsterTitle, monsterImageUrl);
      }

      return;
   };

   downloadImage = async (filename, imageUrl) => {
      console.log("      Downloading...");
      const cleanedFileName = filename
         .replace(/[^a-z0-9]/gi, "_")
         .toLowerCase();
      const options = {
         url: imageUrl,
         dest: `${this.imageDirectory}/${cleanedFileName}.png`,
      };

      await download.image(options);
      console.log("      Done.");
      this.imagesDownloaded += 1;
   };
}

let scrapper = new Scrapper();
scrapper.run();
