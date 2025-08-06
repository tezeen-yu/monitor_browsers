const fs = require("fs");

async function main () {
    const stable_Chrome = "./isNewVersion_chrome_stable.txt";
    const beta_Chrome = "./isNewVersion_chrome_beta.txt";
    const stable_Edge = "./isNewVersion_edge_stable.txt";
    const beta_Edge = "./isNewVersion_edge_beta.txt";

    const filePath = './emailContent.txt';
    fs.closeSync(fs.openSync(filePath, 'w'));

    let isChanged = false;

    if (fs.existsSync(stable_Chrome)){
        const stableInfo = fs.readFileSync(stable_Chrome);
        fs.appendFileSync('./emailContent.txt', `New Stable version for Chrome is found:\r${stableInfo}\r`);
        isChanged = true;
    }
    if (fs.existsSync(beta_Chrome)) {
        const betaInfo = fs.readFileSync(beta_Chrome);
        fs.appendFileSync('./emailContent.txt', `New Beta version for Chrome is found:\r${betaInfo}\r`);
        isChanged = true;
    }
    if (fs.existsSync(stable_Edge)){
        const stableInfo = fs.readFileSync(stable_Edge);
        fs.appendFileSync('./emailContent.txt', `New Stable version for Edge is found:\r${stableInfo}\r`);
        isChanged = true;
    }
    if (fs.existsSync(beta_Edge)) {
        const betaInfo = fs.readFileSync(beta_Edge);
        fs.appendFileSync('./emailContent.txt', `New Beta version for Edge is found:\r${betaInfo}\r`);
        isChanged = true;
    }

    if (isChanged === false){
        fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Failed to delete the emailContent.txt file', err);
            } else {
              console.log('There is no new version found, delete the emailContent.txt file');
            }
          });
    }
}

main().catch(console.error);


