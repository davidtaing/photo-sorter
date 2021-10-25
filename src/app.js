import dotenv from "dotenv";
import path from "path";
import { readdir, mkdir, rename } from "fs/promises";
import { existsSync } from "fs";
import exifr from "exifr";

dotenv.config();

const { SOURCE_EMAIL_FOLDER: sourceFolder, TARGET_EMAIL_FOLDER: targetFolder } =
  process.env;

main();

async function main() {
  try {
    const files = await readdir(sourceFolder);

    let currentDate = "";

    for (const file of files) {
      const filepath = path.resolve(sourceFolder, file);
      const { DateTimeOriginal: datetime } = await exifr.parse(filepath, {
        exif: ["DateTimeOriginal"],
      });
      const dateTimeISO = datetime.toISOString();
      const subdir = `${dateTimeISO.slice(0,7)}`;
      const subdirPath = path.resolve(targetFolder, subdir);

      if (currentDate !== subdir && !existsSync(subdirPath)) {
        currentDate = subdirPath;
        console.log(`Created new folder at: \n ${currentDate}\n`);
        await mkdir(subdirPath);
      }

      const targetPath = path.resolve(subdirPath, file);

      rename(filepath, targetPath);
    }
  } catch (err) {
    console.error(err);
  }
}
