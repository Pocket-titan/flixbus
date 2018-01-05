// Dis de mijne g
const mfb = require('meinfernbus')
const readline = require('readline')

let search_station = async search_name => {
  let stations = await mfb.stations()
  let found_stations = stations.filter(station => {
    return station.name.toLowerCase().includes(search_name.toLowerCase())
  })
  return new Promise((resolve, reject) => {
    resolve(found_stations)
  })
}

const default_options = {
  adults: 1,
	children: 0,
	bikes: 0,
	search_by: 'regions', //or stations
  key: 'uR=s7k6m=[cCS^zY86H8CNAnkC6n' // API key (dunno what this does tho)
}
let find_journey = async (origin, destination, date, options=default_options) => {
  let origin_stations = await search_station(origin)
  let destination_stations = await search_station(destination)
  let journeys = []
  origin_stations.map(origin => origin.id).forEach(origin_id => {
    destination_stations.map(destination => destination.id).forEach(destination_id => {
      journeys = journeys.concat(mfb.journeys(origin_id, destination_id))
    })
  })
  return Promise.all(journeys)
}
// find_journey('Paris', 'Berlin', '5/1/2018')
// .then(res => console.log('res:', res))
// .catch(err => console.warn(err))

const prompt = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    rl.question(question, answer => {
      resolve(answer)
      rl.close()
    })
  })
}

let do_some_shit = async () => {
  let origin_name = await prompt('Where are you traveling from?: ')
  let destination_name = await prompt('Where are you going?: ')
  let from_date = (await prompt('From date: ')).split('/')
  let to_date = (await prompt('To date: ')).split('/')
  // sample input
  // let origin_name = 'Berlin'
  // let destination_name = 'Paris'
  // let from_date = '06/01/2018'.split('/')
  // let to_date = '08/01/2018'.split('/')

  let date_begin = new Date(
    from_date[2],
    from_date[1],
    from_date[0]
  )
  let date_end = new Date(
    to_date[2],
    to_date[1],
    to_date[0]
  )
  let total_journeys = []
  // so beware
  // dunno what date format 'find_journey' accepts
  // but javascript counts months&days from 0.... (jan = 0, dec = 11)
  // fuck javascript amiritguys
  for (let d = date_begin; d <= date_end; d.setDate(d.getDate() + 1)) {
    total_journeys = total_journeys.concat(find_journey(origin_name, destination_name, d))
  }
  let vals = await Promise.all(total_journeys)
  .then(res => res[0])
  .catch(err => console.warn(err))
  all_journeys = []
  vals.filter(arr => arr.length > 0).forEach(val => all_journeys = all_journeys.concat(val))
  all_journeys.sort((a,b) => (a.price.amount > b.price.amount) || a.price.amount === null ? 1 : -1)
  // c = cheapest journey
  let c = all_journeys[0]
  c ? console.log(`The cheapest journey leaves from ${c.origin.name} on ${c.departure}, arrives at ${c.destination.name} on ${c.arrival}, and costs ${c.price.amount} EUR.`)
    : console.log('No journeys found :\'(')
}
do_some_shit()
