const IMAGE_URL = "https://images.ygoprodeck.com/images/cards"
const IMAGE_URL_FIELD = "https://images.ygoprodeck.com/images/cards_cropped"
const BATCH_SIZE = 19 // ygoprodeck has a rate limit of 20 requests per second

const DOWNLOAD_DIR = "./pics"
const DOWNLOAD_DIR_FIELD = "./pics/field"

interface ResponseData {
    id: number,
    name: string,
    type: string,
    frameType: string,
    desc: string,
    race: string,
    archetype: string,
    card_images: {
        id: number
    }[]
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


// Fetch cards
for (const entry of data) {
    for (const image of entry.card_images) {
        const downloadPath = `${DOWNLOAD_DIR}/${image.id}.jpg`
        const file = Bun.file(downloadPath)
        // Let's not download the images we already have downloaded
        if (!(await file.exists())) {
            queue.push(fetchArt(`${IMAGE_URL}/${image.id}.jpg`, downloadPath))
        }
        if (queue.length >= BATCH_SIZE) {
            await Promise.allSettled(queue)
            // Probably log some stuff here
            queue = []
            // Wait for one second
            await Bun.sleep(1000)
        }
    }
    counter++
    if (counter % 200 == 0)
        console.log("Progress:", ((counter / data.length) * 100).toFixed(4), "%")
}
queue = []
counter = 0

// Fetch fields


const params = new URLSearchParams()
params.set("type", "Spell Card")
params.set("race", "field")
const fieldResponse = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?${params.toString()}`)
const fieldJson = await fieldResponse.json() as Response
const fieldData = fieldJson.data

for (const entry of fieldData) {
    for (const image of entry.card_images) {
        const downloadPath = `${DOWNLOAD_DIR_FIELD}/${image.id}.jpg`
        const file = Bun.file(downloadPath)
        // Let's not download the images we already have downloaded
        if (!(await file.exists())) {
            queue.push(fetchArt(`${IMAGE_URL_FIELD}/${image.id}.jpg`, downloadPath))
        }
        if (queue.length >= BATCH_SIZE) {
            await Promise.allSettled(queue)
            // Probably log some stuff here
            queue = []
            // Wait for one second
            await Bun.sleep(1000)
        }
    }
    counter++
    if (counter % 200 == 0)
        console.log("Progress:", ((counter / data.length) * 100).toFixed(4), "%")
}

await Promise.allSettled(queue)
queue = []

async function fetchArt(url: string, downloadPath: string) {
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
