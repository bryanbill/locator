# Locator - An OpenLayers live location tracker

This is a simple OpenLayers application that tracks the location of a device, and displays it on a map. It is intended to be used as a demonstration of the [OpenLayers](https://openlayers.org/) library.

## Usage

TO run this application, you will need to have [Node.js](https://nodejs.org/en/) installed. Then, run the following commands:

```bash
npm install
npm run dev
```

This will start a development server on port 8080. You can then access the application at <<http://localhost:5173>>.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```mermaid
graph TD
  subgraph HTML
    index.html
    style.css
  end

  subgraph JavaScript
    index.js
    sw.js
  end

  subgraph External_Libraries
    OpenLayers
  end

  subgraph IndexedDB
    IDB
  end

  subgraph Service_Worker
    sw.js
  end

  index.js --> OpenLayers
  index.js --> IDB
  index.js --> sw.js
  sw.js --> IndexedDB

  style.css --> index.html
  index.js --> index.html
  OpenLayers --> index.html
  sw.js --> index.html
```
