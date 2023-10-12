import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'

const client = createClient({
  apiVersion: '2022-03-25',
  projectId: 'zqcyefig',
  dataset: 'production',
  token:
    'skcEET1oF0tK6FltENUhc87cmaJ3DgMngWVFCbO6UgLz8VieuUI4s817z3vuROMGwuPngGI9GkicV4xqZssf0wRWFRjKsWOHEv4eJzPCPScsncs1Lsnt3KdLTtjQSLfKvSp5fEaOwCthl1l6tAR02VHXRU4fJlG2gCosIsbESvwWxUn357ob',
})

const concertId = '98205154-0fca-4d86-8c5a-279c7e29bba3' // Your concert ID here
const jsonFilePath = path.resolve(__dirname, 'concertpatch.json')

const fetchConcert = () => client.fetch(`*[_type == "concert" && _id == "${concertId}"][0]`)

const readJsonFile = () => JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))

const updateConcert = (concert, seatingChart) => {
  const transaction = client.transaction().patch(concert._id, {
    set: {
      seatingChart: seatingChart,
    },
  })
  return transaction.commit()
}

const migrateConcertSeatingChart = async () => {
  try {
    const concert = await fetchConcert()
    if (!concert) {
      throw new Error(`Concert with ID ${concertId} not found`)
    }

    const seatingChart = readJsonFile()
    await updateConcert(concert, seatingChart)

    console.log('Seating chart updated successfully')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

migrateConcertSeatingChart()
