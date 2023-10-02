const IMAGE_URL = "https://images.ygoprodeck.com/images/cards"
const BATCH_SIZE = 19 // ygoprodeck has a rate limit of 20 requests per second

const DOWNLOAD_DIR = "./pics"

interface ResponseData {
    id: number,
    name: string,
    type: string,
    frameType: string,
    desc: string,
    race: string,
    archetype: string,
}

interface Response {
    data: ResponseData[]
}

const response = await fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php")
const json = await response.json() as Response
const data = json.data

let queue = []

// So we want to fetch x cards in y seconds
// Ideally we keep track of the cards we have already.

let counter = 0

for (const entry of data) {
    const downloadPath = `${DOWNLOAD_DIR}/${entry.id}.jpg`
    const file = Bun.file(downloadPath)
    // Let's not download the images we already have downloaded
    if (!(await file.exists())) {
        queue.push(fetchCard(`${IMAGE_URL}/${entry.id}.jpg`, downloadPath))
    }
    if (queue.length >= BATCH_SIZE) {
        await Promise.allSettled(queue)
        // Probably log some stuff here
        queue = []
        // Wait for one second
        await Bun.sleep(1000)
    }

    counter++
    if (counter % 200 == 0)
        console.log("Progress:", ((counter / data.length) * 100).toFixed(4), "%")
}


async function fetchCard(url: string, downloadPath: string) {
    try {
        const response = await fetch(url)
        if (response.ok) {
            return Bun.write(downloadPath, await response.blob())
        }
        else
            return response;
    } catch (ex) {
        console.error(ex)
        return false;
    }
}
