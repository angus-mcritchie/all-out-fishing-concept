# Finder sources

The finder runs on real open data, downloaded on **10 Nov 2026** by `_src/finder-data.py` and built into `js/finder-data.js`. Raw downloads are in `_src/finder-raw/` and don't ship.

The page gives no bag limits, size limits or "what's biting" claims. It links to the VFA Recreational Fishing Guide for rules: https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide

## Datasets

| Data | Where from | Licence | Records |
|---|---|---|---|
| Water list | VFA fish stocking database, "Search by Water only" form: https://vfa.vic.gov.au/recreational-fishing/featured/old/db/fishstockdatabase | © State of Victoria. The VFA copyright page (https://vfa.vic.gov.au/copyright) allows personal, in-house or non-commercial reproduction. **Not CC BY.** | 333 waters |
| Stocking records | Same form, one request per water, 1 Jan 2016 to 10 Nov 2026 (`finder-raw/stocking/<vfa id>.json`) | As above | 7,073 stocking rows across 266 waters |
| Water coordinates | The VFA "Waters Last Stocking Map" page, which embeds a JSON list of pins: https://vfa.vic.gov.au/recreational-fishing/featured/old/db/list-last-stocked-information | As above | 304 pins |
| Coordinates for the 37 waters with no VFA pin | Nominatim (OpenStreetMap geocoder), one request a second with a named User-Agent | ODbL 1.0, © OpenStreetMap contributors | 30 found, 7 not found |
| Boat ramps | OpenStreetMap `leisure=slipway` inside Victoria, via the Overpass API | ODbL 1.0, © OpenStreetMap contributors | 423 slipways (412 after dropping private ones). Only 99 have names |
| Jetties and fishing spots | OpenStreetMap `man_made=pier` and `leisure=fishing` inside Victoria, via Overpass | ODbL 1.0 | 3,419 |
| Water photos | Wikimedia Commons API search, kept only CC BY, CC BY-SA, CC0 or public domain, landscape, at least 1000 px wide, file title containing the water's name. Wrong subjects rejected by hand (listed in `fetch_photos`) | Per photo, credited on the photo and in `finder-raw/commons-photos.json` | 21 photos |
| Map | Leaflet 1.9.4 and Leaflet.markercluster 1.5.3 from cdnjs, OpenStreetMap standard tiles | Leaflet BSD-2, markercluster MIT, tiles © OpenStreetMap contributors (OSM tile usage policy) | |
| Species photos | The shop's own crew catch photos in `assets/species` and `assets/opt` | The shop's | 11 species |

## Gaps

- 332 of the 333 waters were fetched. Fyans Lake (VFA id 78) got a 403 from the VFA server three times, so it isn't on the map.
- 66 waters have no stocking since 2016 and aren't shown. The 7 waters Nominatim couldn't place all fall in that group, so no stocked water is missing from the map.
- The page shows 268 waters: 266 stocked ones plus Corio Bay and the Barwon estuary.

## Licence flag

The VFA stocking data is **not** open-licensed. Its copyright page allows non-commercial use only. That's fine for a private concept, but a real launch on a shop site needs written permission from the VFA (victorianfisheries@vfa.vic.gov.au), or a request for the database under CC BY on data.vic.gov.au.

## Not used, and why

- **Coastal Boat Access Points** (data.vic.gov.au, CC BY 4.0): GDB, SHP and TAB only, ordered through Datashare, coastal only, and its metadata says it has been removed from open data and is no longer maintained.
- **Recreational boating facilities** (data.vic.gov.au, CC BY): a 2014 Central Coastal Board layer, coastal only, Datashare order only.
- **Better Boating Victoria ramp finder** (boating.vic.gov.au/ramps): no download or open API found.
- **Vicmap Features of Interest** (open WFS): only 19 features mention a boat ramp.

## How the build reads the data

- **Names:** the VFA lists "Eildon Lake". The page shows "Lake Eildon", and keeps the VFA name in small print. Ids are slugs of the shown name, so `finder.html?water=lake-eildon` works.
- **Type:** taken from the name. River, creek or a stretch ("X to Y") is a river; inlet or estuary is an estuary; everything else is a lake.
- **Region:** the nearest of 16 rough fishing regions in the script. It's a label, not a boundary.
- **Ramps:** the nearest 4 OSM slipways within 15 km of the water's pin. An unnamed ramp shows as "Boat ramp" and its compass direction from the pin.
- **From the bank:** OSM jetties and fishing spots within 5 km of the pin.
- **Species to Lure Browser:** golden perch is "Yellow Belly", every trout and salmon is "Trout", Australian bass is "Bass". Silver perch, Macquarie perch and trout cod have no Lure Browser species, so their cards have no lure link and they get no filter chip.
- **Kit ("Just give me the essentials"):** the shop's own category suggestions by water: cod, trout only, salt, or general native. Not a sourced fact.

## The two salt waters

Nobody stocks Corio Bay or the Barwon estuary, so their species come from VFA fishing guide pages (the panel says so):

- Corio Bay: snapper, King George whiting, flathead, calamari, Australian salmon. https://vfa.vic.gov.au/recreational-fishing/victorias-top-fishing-destinations/port-phillip/where-to-fish-port-phillip/western and https://vfa.vic.gov.au/recreational-fishing/victorias-top-fishing-destinations/port-phillip/where-to-fish-port-phillip/geelong-and-bellarine
- Barwon River estuary: Australian salmon, flathead, silver trevally, black bream, King George whiting, mulloway at times, estuary perch at times. https://vfa.vic.gov.au/recreational-fishing/fishing-locations/inland-angling-guide/areas/barwon/barwon-angling-waters
- Pins: Corio Bay -38.1072, 144.3606 (Wikipedia); Barwon estuary -38.2844, 144.4960 (Better Boating Victoria ramp page for the Barwon River main jetty).

## Rebuild

```
cd /home/angus/Code/hobbies-direct/artifacts/all-out-fishing-review/mockup-v2
python3 -I _src/finder-data.py fetch-waters
python3 -I _src/finder-data.py fetch-stocking     # resumable; add --reverse for a second worker
python3 -I _src/finder-data.py fetch-ramps
python3 -I _src/finder-data.py fetch-shore
python3 -I _src/finder-data.py fetch-geocode
python3 -I _src/finder-data.py fetch-photos
python3 -I _src/finder-data.py build
python3 _src/build.py
```
