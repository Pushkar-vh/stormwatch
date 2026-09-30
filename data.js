/**
 * data.js - Simulated API Data Layer
 * 
 * Simulates fetching data from:
 * - IBTrACS (NOAA NCEI)
 * - OpenStreetMap Overpass API
 * - Google Earth Engine (SRTM elevation)
 * 
 * Contains all storm track data and infrastructure data locally.
 */

// ============================================================
// STORM TRACK DATA (IBTrACS-style)
// ============================================================

const STORM_TRACKS = {
    katrina: {
        id: 'AL122005',
        name: 'Hurricane Katrina',
        basin: 'North Atlantic',
        year: 2005,
        category: 5,
        maxWindSpeed: 175,
        minPressure: 902,
        landfallDate: '2005-08-29',
        region: 'Gulf Coast, USA',
        track: [
            [23.2, -75.5,  35, 1005, '2005-08-23T06:00:00Z'],
            [23.8, -76.8,  45, 1002, '2005-08-23T12:00:00Z'],
            [24.5, -78.0,  55,  997, '2005-08-23T18:00:00Z'],
            [25.1, -79.2,  65,  990, '2005-08-24T00:00:00Z'],
            [25.5, -80.5,  75,  980, '2005-08-24T06:00:00Z'],
            [25.8, -81.8,  85,  970, '2005-08-24T12:00:00Z'],
            [26.0, -83.0, 100,  955, '2005-08-24T18:00:00Z'],
            [26.2, -84.5, 115,  945, '2005-08-25T00:00:00Z'],
            [26.5, -86.0, 130,  935, '2005-08-25T06:00:00Z'],
            [26.8, -87.5, 145,  925, '2005-08-25T12:00:00Z'],
            [27.2, -88.8, 155,  915, '2005-08-25T18:00:00Z'],
            [27.8, -89.5, 165,  908, '2005-08-26T00:00:00Z'],
            [28.5, -90.0, 175,  902, '2005-08-26T06:00:00Z'],
            [29.2, -90.5, 170,  905, '2005-08-26T12:00:00Z'],
            [29.8, -90.8, 160,  910, '2005-08-26T18:00:00Z'],
            [30.2, -91.0, 150,  920, '2005-08-27T00:00:00Z'],
            [30.5, -90.5, 140,  930, '2005-08-27T06:00:00Z'],
            [30.8, -89.8, 125,  940, '2005-08-27T12:00:00Z'],
            [31.2, -89.0, 110,  950, '2005-08-27T18:00:00Z'],
            [31.8, -88.2,  95,  960, '2005-08-28T00:00:00Z'],
            [32.5, -87.5,  80,  970, '2005-08-28T06:00:00Z'],
            [33.2, -86.8,  65,  980, '2005-08-28T12:00:00Z'],
            [34.0, -86.0,  50,  990, '2005-08-28T18:00:00Z'],
            [35.0, -85.5,  40,  995, '2005-08-29T00:00:00Z'],
            [36.0, -85.0,  35, 1000, '2005-08-29T06:00:00Z']
        ]
    },
    harvey: {
        id: 'AL092017',
        name: 'Hurricane Harvey',
        basin: 'North Atlantic',
        year: 2017,
        category: 4,
        maxWindSpeed: 130,
        minPressure: 937,
        landfallDate: '2017-08-25',
        region: 'Texas Coast, USA',
        track: [
            [22.0, -72.0,  35, 1005, '2017-08-17T12:00:00Z'],
            [22.5, -74.0,  40, 1002, '2017-08-18T00:00:00Z'],
            [23.0, -76.0,  45,  998, '2017-08-18T12:00:00Z'],
            [23.5, -78.0,  50,  995, '2017-08-19T00:00:00Z'],
            [24.0, -80.0,  55,  990, '2017-08-19T12:00:00Z'],
            [24.5, -82.0,  60,  985, '2017-08-20T00:00:00Z'],
            [25.0, -84.0,  65,  980, '2017-08-20T12:00:00Z'],
            [25.5, -86.0,  70,  975, '2017-08-21T00:00:00Z'],
            [26.0, -88.0,  75,  970, '2017-08-21T12:00:00Z'],
            [26.5, -90.0,  80,  965, '2017-08-22T00:00:00Z'],
            [27.0, -92.0,  85,  960, '2017-08-22T12:00:00Z'],
            [27.5, -94.0,  90,  955, '2017-08-23T00:00:00Z'],
            [28.0, -95.5, 100,  950, '2017-08-23T12:00:00Z'],
            [28.5, -96.5, 110,  945, '2017-08-24T00:00:00Z'],
            [29.0, -97.0, 120,  940, '2017-08-24T12:00:00Z'],
            [29.2, -97.3, 130,  937, '2017-08-25T00:00:00Z'],
            [29.0, -97.0, 110,  945, '2017-08-25T06:00:00Z'],
            [28.5, -96.5,  90,  955, '2017-08-25T12:00:00Z'],
            [28.0, -96.0,  75,  965, '2017-08-25T18:00:00Z'],
            [27.5, -95.5,  60,  975, '2017-08-26T00:00:00Z'],
            [27.0, -95.0,  50,  985, '2017-08-26T12:00:00Z'],
            [26.5, -94.5,  45,  990, '2017-08-27T00:00:00Z'],
            [26.0, -94.0,  40,  995, '2017-08-27T12:00:00Z']
        ]
    },
    maria: {
        id: 'AL152017',
        name: 'Hurricane Maria',
        basin: 'North Atlantic',
        year: 2017,
        category: 5,
        maxWindSpeed: 175,
        minPressure: 908,
        landfallDate: '2017-09-20',
        region: 'Caribbean / Puerto Rico',
        track: [
            [12.0, -45.0,  35, 1005, '2017-09-16T00:00:00Z'],
            [12.5, -47.0,  45, 1000, '2017-09-16T12:00:00Z'],
            [13.0, -49.0,  55,  995, '2017-09-17T00:00:00Z'],
            [13.5, -51.0,  65,  985, '2017-09-17T12:00:00Z'],
            [14.0, -53.0,  75,  975, '2017-09-18T00:00:00Z'],
            [14.5, -55.0,  85,  965, '2017-09-18T12:00:00Z'],
            [15.0, -57.0, 100,  955, '2017-09-19T00:00:00Z'],
            [15.5, -59.0, 115,  945, '2017-09-19T12:00:00Z'],
            [16.0, -61.0, 130,  935, '2017-09-20T00:00:00Z'],
            [16.5, -63.0, 145,  925, '2017-09-20T06:00:00Z'],
            [17.0, -65.0, 160,  915, '2017-09-20T12:00:00Z'],
            [17.5, -66.5, 175,  908, '2017-09-20T18:00:00Z'],
            [18.0, -67.5, 165,  912, '2017-09-21T00:00:00Z'],
            [18.5, -68.5, 150,  920, '2017-09-21T12:00:00Z'],
            [19.0, -69.5, 135,  930, '2017-09-22T00:00:00Z'],
            [19.5, -70.5, 120,  940, '2017-09-22T12:00:00Z'],
            [20.0, -71.5, 105,  950, '2017-09-23T00:00:00Z'],
            [20.5, -72.5,  90,  960, '2017-09-23T12:00:00Z'],
            [21.0, -73.5,  75,  970, '2017-09-24T00:00:00Z'],
            [21.5, -74.5,  60,  980, '2017-09-24T12:00:00Z'],
            [22.0, -75.5,  50,  990, '2017-09-25T00:00:00Z']
        ]
    },
    ian: {
        id: 'AL092022',
        name: 'Hurricane Ian',
        basin: 'North Atlantic',
        year: 2022,
        category: 4,
        maxWindSpeed: 155,
        minPressure: 937,
        landfallDate: '2022-09-28',
        region: 'Southwest Florida, USA',
        track: [
            [14.0, -75.0,  35, 1005, '2022-09-23T00:00:00Z'],
            [14.5, -77.0,  45, 1000, '2022-09-23T12:00:00Z'],
            [15.0, -79.0,  55,  995, '2022-09-24T00:00:00Z'],
            [15.5, -81.0,  65,  985, '2022-09-24T12:00:00Z'],
            [16.0, -83.0,  75,  975, '2022-09-25T00:00:00Z'],
            [16.5, -85.0,  85,  965, '2022-09-25T12:00:00Z'],
            [17.0, -87.0,  95,  955, '2022-09-26T00:00:00Z'],
            [17.5, -89.0, 105,  950, '2022-09-26T12:00:00Z'],
            [18.0, -91.0, 115,  945, '2022-09-27T00:00:00Z'],
            [18.5, -93.0, 125,  940, '2022-09-27T12:00:00Z'],
            [19.0, -95.0, 135,  937, '2022-09-28T00:00:00Z'],
            [19.5, -97.0, 145,  937, '2022-09-28T06:00:00Z'],
            [20.0, -99.0, 155,  937, '2022-09-28T12:00:00Z'],
            [20.5, -101.0, 140,  945, '2022-09-28T18:00:00Z'],
            [21.0, -103.0, 120,  955, '2022-09-29T00:00:00Z'],
            [21.5, -105.0, 100,  965, '2022-09-29T12:00:00Z'],
            [22.0, -107.0,  80,  975, '2022-09-30T00:00:00Z'],
            [22.5, -109.0,  60,  985, '2022-09-30T12:00:00Z'],
            [23.0, -111.0,  45,  995, '2022-10-01T00:00:00Z']
        ]
    },
    sandy: {
        id: 'AL182012',
        name: 'Hurricane Sandy',
        basin: 'North Atlantic',
        year: 2012,
        category: 3,
        maxWindSpeed: 115,
        minPressure: 940,
        landfallDate: '2012-10-29',
        region: 'Northeast USA / Caribbean',
        track: [
            [13.0, -60.0,  35, 1005, '2012-10-22T00:00:00Z'],
            [13.5, -62.0,  45, 1000, '2012-10-22T12:00:00Z'],
            [14.0, -64.0,  55,  995, '2012-10-23T00:00:00Z'],
            [14.5, -66.0,  65,  985, '2012-10-23T12:00:00Z'],
            [15.0, -68.0,  75,  975, '2012-10-24T00:00:00Z'],
            [15.5, -70.0,  85,  965, '2012-10-24T12:00:00Z'],
            [16.0, -72.0,  95,  955, '2012-10-25T00:00:00Z'],
            [16.5, -74.0, 105,  950, '2012-10-25T12:00:00Z'],
            [17.0, -76.0, 115,  945, '2012-10-26T00:00:00Z'],
            [17.5, -78.0, 110,  945, '2012-10-26T12:00:00Z'],
            [18.0, -79.5, 100,  950, '2012-10-27T00:00:00Z'],
            [19.0, -80.0,  90,  955, '2012-10-27T12:00:00Z'],
            [20.0, -80.5,  80,  960, '2012-10-28T00:00:00Z'],
            [22.0, -80.0,  75,  965, '2012-10-28T12:00:00Z'],
            [25.0, -79.0,  70,  970, '2012-10-29T00:00:00Z'],
            [28.0, -77.0,  75,  965, '2012-10-29T06:00:00Z'],
            [31.0, -75.0,  80,  960, '2012-10-29T12:00:00Z'],
            [34.0, -73.0,  85,  955, '2012-10-29T18:00:00Z'],
            [37.0, -71.0,  90,  950, '2012-10-30T00:00:00Z'],
            [40.0, -69.0,  95,  945, '2012-10-30T06:00:00Z'],
            [42.0, -67.0,  90,  945, '2012-10-30T12:00:00Z'],
            [43.0, -65.0,  80,  950, '2012-10-30T18:00:00Z']
        ]
    },
    irma: {
        id: 'AL112017',
        name: 'Hurricane Irma',
        basin: 'North Atlantic',
        year: 2017,
        category: 5,
        maxWindSpeed: 180,
        minPressure: 914,
        landfallDate: '2017-09-06',
        region: 'Caribbean / Florida',
        track: [
            [12.0, -40.0,  35, 1005, '2017-08-30T00:00:00Z'],
            [12.5, -42.0,  45, 1000, '2017-08-30T12:00:00Z'],
            [13.0, -44.0,  55,  995, '2017-08-31T00:00:00Z'],
            [13.5, -46.0,  65,  985, '2017-08-31T12:00:00Z'],
            [14.0, -48.0,  75,  975, '2017-09-01T00:00:00Z'],
            [14.5, -50.0,  85,  965, '2017-09-01T12:00:00Z'],
            [15.0, -52.0, 100,  955, '2017-09-02T00:00:00Z'],
            [15.5, -54.0, 115,  945, '2017-09-02T12:00:00Z'],
            [16.0, -56.0, 130,  935, '2017-09-03T00:00:00Z'],
            [16.5, -58.0, 145,  925, '2017-09-03T12:00:00Z'],
            [17.0, -60.0, 160,  915, '2017-09-04T00:00:00Z'],
            [17.5, -62.0, 175,  914, '2017-09-04T12:00:00Z'],
            [18.0, -64.0, 180,  914, '2017-09-05T00:00:00Z'],
            [18.5, -66.0, 175,  915, '2017-09-05T12:00:00Z'],
            [19.0, -68.0, 165,  920, '2017-09-06T00:00:00Z'],
            [19.5, -70.0, 155,  925, '2017-09-06T12:00:00Z'],
            [20.0, -72.0, 145,  930, '2017-09-07T00:00:00Z'],
            [20.5, -74.0, 135,  935, '2017-09-07T12:00:00Z'],
            [21.0, -76.0, 125,  940, '2017-09-08T00:00:00Z'],
            [21.5, -78.0, 115,  945, '2017-09-08T12:00:00Z'],
            [22.0, -80.0, 105,  950, '2017-09-09T00:00:00Z'],
            [22.5, -82.0,  95,  955, '2017-09-09T12:00:00Z'],
            [23.0, -84.0,  85,  960, '2017-09-10T00:00:00Z'],
            [23.5, -86.0,  75,  965, '2017-09-10T12:00:00Z'],
            [24.0, -88.0,  65,  970, '2017-09-11T00:00:00Z']
        ]
    },
    michael: {
        id: 'AL142018',
        name: 'Hurricane Michael',
        basin: 'North Atlantic',
        year: 2018,
        category: 5,
        maxWindSpeed: 160,
        minPressure: 919,
        landfallDate: '2018-10-10',
        region: 'Florida Panhandle, USA',
        track: [
            [14.0, -75.0,  35, 1005, '2018-10-06T00:00:00Z'],
            [14.5, -77.0,  45, 1000, '2018-10-06T12:00:00Z'],
            [15.0, -79.0,  55,  995, '2018-10-07T00:00:00Z'],
            [15.5, -81.0,  65,  985, '2018-10-07T12:00:00Z'],
            [16.0, -83.0,  75,  975, '2018-10-08T00:00:00Z'],
            [16.5, -85.0,  85,  965, '2018-10-08T12:00:00Z'],
            [17.0, -87.0, 100,  955, '2018-10-09T00:00:00Z'],
            [17.5, -89.0, 115,  945, '2018-10-09T12:00:00Z'],
            [18.0, -91.0, 130,  935, '2018-10-10T00:00:00Z'],
            [18.5, -93.0, 145,  925, '2018-10-10T06:00:00Z'],
            [19.0, -94.5, 160,  919, '2018-10-10T12:00:00Z'],
            [19.5, -95.5, 155,  920, '2018-10-10T18:00:00Z'],
            [20.0, -96.0, 140,  930, '2018-10-11T00:00:00Z'],
            [20.5, -96.5, 120,  940, '2018-10-11T06:00:00Z'],
            [21.0, -96.8, 100,  950, '2018-10-11T12:00:00Z'],
            [21.5, -97.0,  80,  960, '2018-10-11T18:00:00Z'],
            [22.0, -97.2,  65,  970, '2018-10-12T00:00:00Z'],
            [22.5, -97.3,  50,  980, '2018-10-12T06:00:00Z'],
            [23.0, -97.4,  40,  990, '2018-10-12T12:00:00Z']
        ]
    },
    laura: {
        id: 'AL132020',
        name: 'Hurricane Laura',
        basin: 'North Atlantic',
        year: 2020,
        category: 4,
        maxWindSpeed: 150,
        minPressure: 937,
        landfallDate: '2020-08-27',
        region: 'Louisiana Coast, USA',
        track: [
            [14.0, -55.0,  35, 1005, '2020-08-21T00:00:00Z'],
            [14.5, -57.0,  45, 1000, '2020-08-21T12:00:00Z'],
            [15.0, -59.0,  55,  995, '2020-08-22T00:00:00Z'],
            [15.5, -61.0,  65,  985, '2020-08-22T12:00:00Z'],
            [16.0, -63.0,  75,  975, '2020-08-23T00:00:00Z'],
            [16.5, -65.0,  85,  965, '2020-08-23T12:00:00Z'],
            [17.0, -67.0, 100,  955, '2020-08-24T00:00:00Z'],
            [17.5, -69.0, 115,  945, '2020-08-24T12:00:00Z'],
            [18.0, -71.0, 130,  937, '2020-08-25T00:00:00Z'],
            [18.5, -73.0, 140,  937, '2020-08-25T12:00:00Z'],
            [19.0, -75.0, 150,  937, '2020-08-26T00:00:00Z'],
            [19.5, -77.0, 145,  940, '2020-08-26T12:00:00Z'],
            [20.0, -79.0, 135,  945, '2020-08-27T00:00:00Z'],
            [20.5, -81.0, 120,  950, '2020-08-27T06:00:00Z'],
            [21.0, -83.0, 105,  955, '2020-08-27T12:00:00Z'],
            [21.5, -85.0,  90,  960, '2020-08-27T18:00:00Z'],
            [22.0, -87.0,  75,  965, '2020-08-28T00:00:00Z'],
            [22.5, -89.0,  60,  970, '2020-08-28T06:00:00Z'],
            [23.0, -91.0,  50,  980, '2020-08-28T12:00:00Z'],
            [23.5, -93.0,  40,  990, '2020-08-28T18:00:00Z']
        ]
    },
    ida: {
        id: 'AL092021',
        name: 'Hurricane Ida',
        basin: 'North Atlantic',
        year: 2021,
        category: 4,
        maxWindSpeed: 150,
        minPressure: 929,
        landfallDate: '2021-08-29',
        region: 'Louisiana Coast, USA',
        track: [
            [14.0, -65.0,  35, 1005, '2021-08-26T00:00:00Z'],
            [14.5, -67.0,  45, 1000, '2021-08-26T12:00:00Z'],
            [15.0, -69.0,  55,  995, '2021-08-27T00:00:00Z'],
            [15.5, -71.0,  65,  985, '2021-08-27T12:00:00Z'],
            [16.0, -73.0,  75,  975, '2021-08-28T00:00:00Z'],
            [16.5, -75.0,  85,  965, '2021-08-28T12:00:00Z'],
            [17.0, -77.0, 100,  955, '2021-08-29T00:00:00Z'],
            [17.5, -79.0, 115,  945, '2021-08-29T06:00:00Z'],
            [18.0, -81.0, 130,  937, '2021-08-29T12:00:00Z'],
            [18.5, -83.0, 145,  929, '2021-08-29T18:00:00Z'],
            [19.0, -85.0, 150,  929, '2021-08-30T00:00:00Z'],
            [19.5, -87.0, 140,  935, '2021-08-30T06:00:00Z'],
            [20.0, -89.0, 125,  945, '2021-08-30T12:00:00Z'],
            [20.5, -91.0, 110,  955, '2021-08-30T18:00:00Z'],
            [21.0, -93.0,  95,  965, '2021-08-31T00:00:00Z'],
            [21.5, -95.0,  80,  975, '2021-08-31T06:00:00Z'],
            [22.0, -97.0,  65,  985, '2021-08-31T12:00:00Z'],
            [22.5, -99.0,  50,  995, '2021-08-31T18:00:00Z']
        ]
    }
};

// ============================================================
// INFRASTRUCTURE DATA (OSM Overpass-style)
// ============================================================

const INFRASTRUCTURE_DATA = {
    katrina: [
        { id: 'K001', name: 'Charity Hospital', type: 'hospital', lat: 29.9584, lon: -90.0644, elevation: 2, capacity: 500, status: 'operational' },
        { id: 'K002', name: 'New Orleans Power Station', type: 'power', lat: 29.9500, lon: -90.0700, elevation: 1, capacity: 250, status: 'operational' },
        { id: 'K003', name: 'St. Bernard Elementary', type: 'school', lat: 29.9300, lon: -89.9900, elevation: 3, capacity: 350, status: 'operational' },
        { id: 'K004', name: 'Gulfport Water Treatment', type: 'water', lat: 30.3674, lon: -89.0928, elevation: 5, capacity: 100, status: 'operational' },
        { id: 'K005', name: 'Biloxi Regional Medical', type: 'hospital', lat: 30.3960, lon: -88.8853, elevation: 8, capacity: 300, status: 'operational' },
        { id: 'K006', name: 'Louisiana Superdome', type: 'shelter', lat: 29.9511, lon: -90.0811, elevation: 2, capacity: 72000, status: 'operational' },
        { id: 'K007', name: 'Port of New Orleans', type: 'port', lat: 29.9400, lon: -90.0600, elevation: 1, capacity: 5000, status: 'operational' },
        { id: 'K008', name: 'MS Gulf Coast Airport', type: 'airport', lat: 30.3450, lon: -89.8200, elevation: 10, capacity: 2000, status: 'operational' },
        { id: 'K009', name: 'Slidell Memorial Hospital', type: 'hospital', lat: 30.2752, lon: -89.7811, elevation: 6, capacity: 200, status: 'operational' },
        { id: 'K010', name: 'Entergy Nuclear Plant', type: 'power', lat: 30.4500, lon: -90.2500, elevation: 4, capacity: 1200, status: 'operational' },
        { id: 'K011', name: 'Bay St. Louis Harbor', type: 'port', lat: 30.3088, lon: -89.3300, elevation: 2, capacity: 800, status: 'operational' },
        { id: 'K012', name: 'Hancock County EOC', type: 'emergency', lat: 30.3100, lon: -89.3500, elevation: 7, capacity: 100, status: 'operational' }
    ],
    harvey: [
        { id: 'H001', name: 'Houston General Hospital', type: 'hospital', lat: 29.7604, lon: -95.3698, elevation: 15, capacity: 800, status: 'operational' },
        { id: 'H002', name: 'Texas Medical Center', type: 'hospital', lat: 29.7050, lon: -95.4000, elevation: 14, capacity: 2000, status: 'operational' },
        { id: 'H003', name: 'Houston Ship Channel', type: 'port', lat: 29.7300, lon: -94.9800, elevation: 3, capacity: 10000, status: 'operational' },
        { id: 'H004', name: 'Corpus Christi Desalination', type: 'water', lat: 27.8006, lon: -97.3964, elevation: 4, capacity: 500, status: 'operational' },
        { id: 'H005', name: 'Rockport Elementary', type: 'school', lat: 28.0200, lon: -97.0500, elevation: 6, capacity: 400, status: 'operational' },
        { id: 'H006', name: 'NRG Stadium', type: 'shelter', lat: 29.6847, lon: -95.4107, elevation: 13, capacity: 72000, status: 'operational' },
        { id: 'H007', name: 'Houston Fire Station 72', type: 'emergency', lat: 29.7800, lon: -95.3500, elevation: 16, capacity: 50, status: 'operational' },
        { id: 'H008', name: 'Baytown Refinery', type: 'industrial', lat: 29.7355, lon: -94.9774, elevation: 5, capacity: 3000, status: 'operational' },
        { id: 'H009', name: 'Galveston Seawall', type: 'coastal', lat: 29.3013, lon: -94.7977, elevation: 3, capacity: 0, status: 'operational' },
        { id: 'H010', name: 'Hobby Airport', type: 'airport', lat: 29.6454, lon: -95.2789, elevation: 12, capacity: 5000, status: 'operational' }
    ],
    maria: [
        { id: 'M001', name: 'Hospital San Juan', type: 'hospital', lat: 18.4655, lon: -66.1057, elevation: 12, capacity: 450, status: 'operational' },
        { id: 'M002', name: 'Punta Santiago Power', type: 'power', lat: 18.0800, lon: -65.7500, elevation: 5, capacity: 180, status: 'operational' },
        { id: 'M003', name: 'San Juan Port Authority', type: 'port', lat: 18.4500, lon: -66.1200, elevation: 3, capacity: 3000, status: 'operational' },
        { id: 'M004', name: 'Mayaguez Water Plant', type: 'water', lat: 18.2013, lon: -67.1395, elevation: 20, capacity: 120, status: 'operational' },
        { id: 'M005', name: 'Ponce Regional Hospital', type: 'hospital', lat: 18.0111, lon: -66.6141, elevation: 8, capacity: 250, status: 'operational' },
        { id: 'M006', name: 'Luis Munoz Marin Airport', type: 'airport', lat: 18.4394, lon: -66.0018, elevation: 3, capacity: 4000, status: 'operational' },
        { id: 'M007', name: 'Arecibo Emergency Shelter', type: 'shelter', lat: 18.4725, lon: -66.7208, elevation: 25, capacity: 500, status: 'operational' },
        { id: 'M008', name: 'Caguas Gov Center', type: 'emergency', lat: 18.2341, lon: -66.0485, elevation: 80, capacity: 200, status: 'operational' },
        { id: 'M009', name: 'Fajardo Lighthouse', type: 'coastal', lat: 18.3258, lon: -65.6524, elevation: 15, capacity: 0, status: 'operational' },
        { id: 'M010', name: 'Aguadilla Desalination', type: 'water', lat: 18.4275, lon: -67.1541, elevation: 10, capacity: 80, status: 'operational' }
    ],
    ian: [
        { id: 'I001', name: 'Lee Health Hospital', type: 'hospital', lat: 26.6406, lon: -81.8723, elevation: 4, capacity: 600, status: 'operational' },
        { id: 'I002', name: 'Fort Myers Power Grid', type: 'power', lat: 26.6214, lon: -81.8253, elevation: 3, capacity: 400, status: 'operational' },
        { id: 'I003', name: 'Port of Tampa Bay', type: 'port', lat: 27.9506, lon: -82.4572, elevation: 5, capacity: 8000, status: 'operational' },
        { id: 'I004', name: 'Cape Coral Water Utility', type: 'water', lat: 26.5629, lon: -81.9495, elevation: 3, capacity: 200, status: 'operational' },
        { id: 'I005', name: 'Charlotte High School', type: 'school', lat: 26.9348, lon: -82.0451, elevation: 6, capacity: 1200, status: 'operational' },
        { id: 'I006', name: 'Tropicana Field Shelter', type: 'shelter', lat: 27.7683, lon: -82.6534, elevation: 8, capacity: 42000, status: 'operational' },
        { id: 'I007', name: 'SW Florida Intl Airport', type: 'airport', lat: 26.5362, lon: -81.7552, elevation: 10, capacity: 6000, status: 'operational' },
        { id: 'I008', name: 'Punta Gorda EOC', type: 'emergency', lat: 26.9298, lon: -82.0458, elevation: 5, capacity: 150, status: 'operational' },
        { id: 'I009', name: 'Naples Seawall System', type: 'coastal', lat: 26.1420, lon: -81.7948, elevation: 2, capacity: 0, status: 'operational' },
        { id: 'I010', name: 'Sarasota Memorial', type: 'hospital', lat: 27.3364, lon: -82.5307, elevation: 12, capacity: 500, status: 'operational' }
    ],
    sandy: [
        { id: 'S001', name: 'NYC General Hospital', type: 'hospital', lat: 40.7128, lon: -74.0060, elevation: 10, capacity: 1000, status: 'operational' },
        { id: 'S002', name: 'Con Edison Power Grid', type: 'power', lat: 40.7580, lon: -73.9855, elevation: 8, capacity: 500, status: 'operational' },
        { id: 'S003', name: 'Port of New York', type: 'port', lat: 40.6689, lon: -74.0444, elevation: 3, capacity: 15000, status: 'operational' },
        { id: 'S004', name: 'Jersey City Water', type: 'water', lat: 40.7178, lon: -74.0431, elevation: 5, capacity: 300, status: 'operational' },
        { id: 'S005', name: 'Brooklyn High School', type: 'school', lat: 40.6782, lon: -73.9442, elevation: 12, capacity: 800, status: 'operational' },
        { id: 'S006', name: 'Javits Center Shelter', type: 'shelter', lat: 40.7570, lon: -74.0020, elevation: 10, capacity: 50000, status: 'operational' },
        { id: 'S007', name: 'JFK Airport', type: 'airport', lat: 40.6413, lon: -73.7781, elevation: 4, capacity: 10000, status: 'operational' },
        { id: 'S008', name: 'NYC Emergency Mgmt', type: 'emergency', lat: 40.7128, lon: -74.0060, elevation: 10, capacity: 200, status: 'operational' },
        { id: 'S009', name: 'Hudson River Seawall', type: 'coastal', lat: 40.7033, lon: -74.0170, elevation: 2, capacity: 0, status: 'operational' },
        { id: 'S010', name: 'Staten Island Hospital', type: 'hospital', lat: 40.5795, lon: -74.1502, elevation: 15, capacity: 400, status: 'operational' }
    ],
    irma: [
        { id: 'R001', name: 'Miami General Hospital', type: 'hospital', lat: 25.7617, lon: -80.1918, elevation: 3, capacity: 700, status: 'operational' },
        { id: 'R002', name: 'Florida Power & Light', type: 'power', lat: 25.7906, lon: -80.1300, elevation: 2, capacity: 600, status: 'operational' },
        { id: 'R003', name: 'Port of Miami', type: 'port', lat: 25.7781, lon: -80.1772, elevation: 3, capacity: 12000, status: 'operational' },
        { id: 'R004', name: 'Miami-Dade Water Plant', type: 'water', lat: 25.7200, lon: -80.2700, elevation: 4, capacity: 400, status: 'operational' },
        { id: 'R005', name: 'Orlando High School', type: 'school', lat: 28.5383, lon: -81.3792, elevation: 25, capacity: 1500, status: 'operational' },
        { id: 'R006', name: 'Amway Center Shelter', type: 'shelter', lat: 28.5383, lon: -81.3800, elevation: 22, capacity: 20000, status: 'operational' },
        { id: 'R007', name: 'Miami Intl Airport', type: 'airport', lat: 25.7959, lon: -80.2870, elevation: 3, capacity: 8000, status: 'operational' },
        { id: 'R008', name: 'Tampa EOC', type: 'emergency', lat: 27.9506, lon: -82.4572, elevation: 12, capacity: 180, status: 'operational' },
        { id: 'R009', name: 'Miami Beach Seawall', type: 'coastal', lat: 25.7907, lon: -80.1300, elevation: 2, capacity: 0, status: 'operational' },
        { id: 'R010', name: 'Tampa General Hospital', type: 'hospital', lat: 27.9420, lon: -82.4572, elevation: 10, capacity: 500, status: 'operational' }
    ],
    michael: [
        { id: 'C001', name: 'Panama City Hospital', type: 'hospital', lat: 30.1588, lon: -85.6602, elevation: 5, capacity: 350, status: 'operational' },
        { id: 'C002', name: 'Gulf Power Station', type: 'power', lat: 30.1800, lon: -85.6500, elevation: 4, capacity: 300, status: 'operational' },
        { id: 'C003', name: 'Port of Panama City', type: 'port', lat: 30.1500, lon: -85.6600, elevation: 3, capacity: 2000, status: 'operational' },
        { id: 'C004', name: 'Bay County Water', type: 'water', lat: 30.1700, lon: -85.6400, elevation: 5, capacity: 150, status: 'operational' },
        { id: 'C005', name: 'Jinks Middle School', type: 'school', lat: 30.1600, lon: -85.6500, elevation: 6, capacity: 600, status: 'operational' },
        { id: 'C006', name: 'EOC Shelter Bay', type: 'shelter', lat: 30.1700, lon: -85.6300, elevation: 7, capacity: 3000, status: 'operational' },
        { id: 'C007', name: 'NW Florida Airport', type: 'airport', lat: 30.3500, lon: -85.7900, elevation: 15, capacity: 3000, status: 'operational' },
        { id: 'C008', name: 'Bay County EOC', type: 'emergency', lat: 30.1600, lon: -85.6600, elevation: 6, capacity: 100, status: 'operational' },
        { id: 'C009', name: 'St. Andrews Seawall', type: 'coastal', lat: 30.1400, lon: -85.6800, elevation: 2, capacity: 0, status: 'operational' },
        { id: 'C010', name: 'Gulf Coast Medical', type: 'hospital', lat: 30.1500, lon: -85.6700, elevation: 5, capacity: 250, status: 'operational' }
    ],
    laura: [
        { id: 'L001', name: 'Lake Charles Hospital', type: 'hospital', lat: 30.2266, lon: -93.2174, elevation: 5, capacity: 400, status: 'operational' },
        { id: 'L002', name: 'Entergy Lake Charles', type: 'power', lat: 30.2300, lon: -93.2100, elevation: 4, capacity: 350, status: 'operational' },
        { id: 'L003', name: 'Port of Lake Charles', type: 'port', lat: 30.2100, lon: -93.2500, elevation: 3, capacity: 4000, status: 'operational' },
        { id: 'L004', name: 'Calcasieu Water Plant', type: 'water', lat: 30.2400, lon: -93.2000, elevation: 5, capacity: 200, status: 'operational' },
        { id: 'L005', name: 'LaGrange High School', type: 'school', lat: 30.2200, lon: -93.2200, elevation: 6, capacity: 800, status: 'operational' },
        { id: 'L006', name: 'Lake Charles Civic Center', type: 'shelter', lat: 30.2266, lon: -93.2174, elevation: 5, capacity: 15000, status: 'operational' },
        { id: 'L007', name: 'Chennault Airport', type: 'airport', lat: 30.2100, lon: -93.1500, elevation: 8, capacity: 2000, status: 'operational' },
        { id: 'L008', name: 'Calcasieu EOC', type: 'emergency', lat: 30.2300, lon: -93.2200, elevation: 5, capacity: 120, status: 'operational' },
        { id: 'L009', name: 'Calcasieu Seawall', type: 'coastal', lat: 30.2000, lon: -93.2600, elevation: 2, capacity: 0, status: 'operational' },
        { id: 'L010', name: 'Christus Hospital', type: 'hospital', lat: 30.2200, lon: -93.2300, elevation: 5, capacity: 300, status: 'operational' }
    ],
    ida: [
        { id: 'D001', name: 'New Iberia Hospital', type: 'hospital', lat: 29.9940, lon: -91.8180, elevation: 8, capacity: 300, status: 'operational' },
        { id: 'D002', name: 'Entergy Louisiana', type: 'power', lat: 30.0000, lon: -91.8000, elevation: 6, capacity: 400, status: 'operational' },
        { id: 'D003', name: 'Port of Iberia', type: 'port', lat: 29.9800, lon: -91.8200, elevation: 4, capacity: 1500, status: 'operational' },
        { id: 'D004', name: 'Iberia Water District', type: 'water', lat: 29.9900, lon: -91.8100, elevation: 7, capacity: 100, status: 'operational' },
        { id: 'D005', name: 'New Iberia High', type: 'school', lat: 29.9900, lon: -91.8200, elevation: 8, capacity: 700, status: 'operational' },
        { id: 'D006', name: 'Lafayette Shelter', type: 'shelter', lat: 30.2241, lon: -92.0198, elevation: 20, capacity: 10000, status: 'operational' },
        { id: 'D007', name: 'Lafayette Airport', type: 'airport', lat: 30.2052, lon: -91.9877, elevation: 12, capacity: 3000, status: 'operational' },
        { id: 'D008', name: 'Lafayette EOC', type: 'emergency', lat: 30.2241, lon: -92.0198, elevation: 20, capacity: 150, status: 'operational' },
        { id: 'D009', name: 'Vermilion Bay Seawall', type: 'coastal', lat: 29.9500, lon: -92.0500, elevation: 2, capacity: 0, status: 'operational' },
        { id: 'D010', name: 'Lafayette General', type: 'hospital', lat: 30.2241, lon: -92.0198, elevation: 20, capacity: 600, status: 'operational' }
    ]
};

// Also merge infrastructure data
const INFRASTRUCTURE_DATA_MERGED = Object.assign({}, INFRASTRUCTURE_DATA, {
    // Infrastructure from original data.js is already more detailed
    // storm_data.js infrastructure will be merged in via Object.assign at runtime
});

// ============================================================
// API SIMULATION FUNCTIONS
// ============================================================

async function fetchStormTrack(stormId) {
    await simulateLatency(300, 800);
    // Use merged data: storm_data.js (100 storms) + original detailed storms
    var merged = Object.assign({}, STORM_TRACKS);
    if (typeof STORM_TRACKS_MERGED !== 'undefined') {
        Object.keys(STORM_TRACKS_MERGED).forEach(function(key) {
            merged[key] = STORM_TRACKS_MERGED[key];
        });
    }
    const track = merged[stormId];
    if (!track) throw new Error('Storm not found: ' + stormId);
    console.log('[IBTrACS] Fetched: ' + track.name + ' (' + track.track.length + ' points)');
    return JSON.parse(JSON.stringify(track));
}

async function fetchInfrastructure(stormId) {
    await simulateLatency(400, 1000);
    // Use merged infrastructure data
    var mergedInfra = Object.assign({}, INFRASTRUCTURE_DATA);
    if (typeof INFRASTRUCTURE_DATA_MERGED !== 'undefined') {
        Object.keys(INFRASTRUCTURE_DATA_MERGED).forEach(function(key) {
            mergedInfra[key] = INFRASTRUCTURE_DATA_MERGED[key];
        });
    }
    const infra = mergedInfra[stormId];
    if (!infra) throw new Error('No infrastructure for: ' + stormId);
    console.log('[Overpass] Fetched: ' + infra.length + ' points for ' + stormId);
    return JSON.parse(JSON.stringify(infra));
}

async function fetchElevation(lat, lon) {
    await simulateLatency(50, 150);
    var elevation = Math.max(1, Math.round(Math.abs(lat * 0.5) + Math.random() * 20));
    return { elevation: elevation, resolution: '30m', source: 'SRTM (simulated)', point: { lat: lat, lon: lon } };
}

async function fetchAllStormData(stormIds) {
    console.log('[API] Fetching data for ' + stormIds.length + ' storm(s): ' + stormIds.join(', '));

    var trackPromises = stormIds.map(function(id) { return fetchStormTrack(id); });
    var tracks = await Promise.all(trackPromises);

    var infraPromises = stormIds.map(function(id) { return fetchInfrastructure(id); });
    var infraResults = await Promise.all(infraPromises);
    var allInfrastructure = infraResults.flat();

    var elevationPromises = allInfrastructure.map(function(point) {
        return fetchElevation(point.lat, point.lon);
    });
    var elevations = await Promise.all(elevationPromises);

    var enrichedInfrastructure = allInfrastructure.map(function(point, i) {
        var p = Object.assign({}, point);
        p.elevationData = elevations[i];
        return p;
    });

    return {
        tracks: tracks,
        infrastructure: enrichedInfrastructure,
        metadata: {
            fetchedAt: new Date().toISOString(),
            sources: ['IBTrACS (simulated)', 'OSM Overpass (simulated)', 'GEE SRTM (simulated)'],
            stormCount: stormIds.length
        }
    };
}

function simulateLatency(min, max) {
    var delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(function(resolve) { setTimeout(resolve, delay); });
}

function getStormCatalog() {
    // Use merged data: storm_data.js (100 storms) + original detailed storms
    var merged = {};
    // First add all 100 storms from storm_data.js
    if (typeof STORM_TRACKS !== 'undefined') {
        Object.keys(STORM_TRACKS).forEach(function(key) {
            merged[key] = STORM_TRACKS[key];
        });
    }
    // Then override with more detailed tracks from original data
    if (typeof STORM_TRACKS_MERGED !== 'undefined') {
        Object.keys(STORM_TRACKS_MERGED).forEach(function(key) {
            merged[key] = STORM_TRACKS_MERGED[key];
        });
    }
    return Object.keys(merged).map(function(key) {
        var storm = merged[key];
        return {
            id: key,
            name: storm.name,
            year: storm.year,
            category: storm.category,
            maxWindSpeed: storm.maxWindSpeed,
            region: storm.region
        };
    });
}

function searchStorms(query) {
    if (!query || query.trim() === '') return getStormCatalog();
    var q = query.toLowerCase().trim();
    return getStormCatalog().filter(function(storm) {
        return storm.name.toLowerCase().includes(q) ||
               storm.region.toLowerCase().includes(q) ||
               storm.year.toString().includes(q) ||
               storm.id.toLowerCase().includes(q);
    });
}
