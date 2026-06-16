# Latest Status - June 13, 2021

We are looking for people to get involved!  Take a look at some of the current Feature Request Issues, and let us know if you can help.

- Create Docker for Tilemill releases: https://github.com/tilemill-project/tilemill/issues/2742
- Create Survey of Users: https://github.com/tilemill-project/tilemill/issues/2743
- Get Funding for Tilemill: https://github.com/tilemill-project/tilemill/issues/2744


# General Info
TileMill is a modern map design studio powered by [Node.js](https://nodejs.org) and [Mapnik](https://mapnik.org).

- TileMill is tested with Node.js 18 and uses the Mapnik 4 Node bindings.
- TileMill currently only works in server mode, there is no standalone GUI.  Your browser is used for the interface.
- There are no native packages provided. Installation requires cloning this repo. See details below under *Installation*.
- Tilemill should theoretically work on the Windows platform, but it isn't tested.


# Dependencies

- Mapnik 4 via the `@mapnik/mapnik` npm package
- Node.js >= 16.0.0 and npm >= 8.0.0


# Installation
### Quick installation instructions for OSX:

    git clone https://github.com/tilemill-project/tilemill.git
    cd tilemill
    nvm install 18
    nvm use 18
    npm install
    npm start

### Installation Scripts 
Scripts have been created that will do most everything for you. They were written for MacOS, but may still be usable for Ubunto and Windows with some modification.  (If you are successful with Ubunto and Windows, please post an Issue to let us know!)

[Installation Script Instructions](https://tilemill-project.github.io/tilemill/docs/mac-install/)


[Full Installation instructions can be found in the TileMill Documentation](https://tilemill-project.github.io/tilemill/docs/install/).

### Docker
It is also possible to run tilemill as a docker container:

    git clone https://github.com/tilemill-project/tilemill.git
    cd tilemill
    docker-compose up
    
This will host a docker container which uses the port 20008 and 20009 for tilemill, tilemill is then reachable under [http://localhost:20009](http://localhost:20009) .
Additionally, a postgis instance is started as well which is reachable under 

	host=localhost port=5432 user=docker password=docker dbname=gis

Docker hosted volumes are used for the containers, hence if you want to use sqlite dbs you have to interact with those to get the dbs into the docker container.
    
# Build Status, Running Tests, Updating Documentation

See CONTRIBUTING.md
