# ToolNest - Free Browser-Based Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/toolnest)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Ftoolnest.example.com)](https://toolnest.example.com)

> Fast, simple, and completely free browser-based tools. Process files and data entirely in your browser — no accounts, no uploads, no data collection.

## 🎯 Features

### Core Tools
- **Image Tools** - Resize, convert (PNG ↔ JPG), optimize images
- **PDF Tools** - Merge, split, reorder PDF files
- **QR Code Generator** - Create QR codes for URLs, text, vCards
- **Text Cleaner** - Remove spaces, HTML, emojis, special characters
- **Base64 Tools** - Encode/decode text and files to Base64

### Key Benefits
- ✅ **100% Private** - All processing happens in your browser
- ✅ **No Accounts** - No registration or login required
- ✅ **Open Source** - View and audit our source code
- ✅ **Offline Ready** - Service Worker enables offline functionality
- ✅ **Fast** - No server requests, instant processing
- ✅ **Accessible** - WCAG 2.1 AA compliant, keyboard navigation
- ✅ **Responsive** - Works seamlessly on desktop, tablet, mobile

## 🚀 Quick Start

### Visit Online
Simply go to [https://toolnest.example.com](https://toolnest.example.com) and start using the tools.

### Run Locally
```bash
# Clone the repository
git clone https://github.com/toolnest/toolnest.git
cd toolnest

# Start a local web server (Python 3)
python -m http.server 8000

# Or using Node.js
npx serve

# Visit http://localhost:8000
```

## 📁 Project Structure

```
toolnest/
├── index.html              # Main landing page
├── index-new.html          # Enhanced version with new features
├── support.html            # Support/FAQ page
├── privacy-new.html        # Privacy policy
├── styles.css              # Original styles
├── styles-new.css          # Enhanced modern styles
├── favicon.png             # Site icon
│
├── JS/
│   ├── main.js             # Core functionality
│   ├── utils.js            # Utility functions (clipboard, download, etc.)
│   └── TOOLS-JS/
│       ├── base64-tools.js
│       ├── image-tools.js
│       ├── qr-generator.js
│       ├── text-cleaner.js
│       └── PDFMerger.js
│
├── tools/
│   ├── base64-tools.html
│   ├── image-tools.html
│   ├── qr-generator.html
│   ├── text-cleaner.html
│   ├── text-document-tools.html
│   └── style.css
│
├── sw.js                   # Original Service Worker
├── sw-enhanced.js          # Enhanced Service Worker v2.0
│
├── assets/
│   └── js/workers/
│       └── image-worker.js # Web Worker for image processing
│
├── ads/
│   └── adsterra.js         # Advertising script
│
├── fixtures/               # Test data
├── scripts/
│   ├── smoke-tests.js
│   └── puppeteer-tests.js
│
├── package.json            # Dependencies
├── QA.md                   # QA documentation
└── README.md              # This file
```

## 🛠️ Development

### Prerequisites
- Node.js 14+ (for testing)
- Modern browser with ES6+ support
- Text editor or IDE

### Installation

```bash
# Install dependencies
npm install

# Run tests
npm run test
npm run smoke
npm run test:browser

# Build (if applicable)
npm run build
```

### Key Technologies
- **Vanilla JavaScript** - No frameworks, lightweight
- **HTML5 & CSS3** - Modern web standards
- **Service Workers** - Offline functionality
- **Web Workers** - Background processing
- **Fetch API** - Modern HTTP requests
- **IndexedDB** - Client-side storage

### Code Standards
- ES6+ JavaScript
- JSDoc comments for functions
- BEM CSS naming convention
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design

## 🔐 Privacy & Security

### Data Handling
- ✅ No data collected or stored on servers
- ✅ Files processed entirely in your browser
- ✅ HTTPS connections only
- ✅ No third-party data sharing
- ✅ Minimal analytics (aggregated, non-personal)

### Compliance
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- LGPD (Lei Geral de Proteção de Dados)
- PIPEDA (Personal Information Protection)

See [Privacy Policy](privacy-new.html) for details.

## 📊 Performance

### Optimization Strategies
- **Lazy Loading** - Images and components load on demand
- **Code Splitting** - Tool-specific code loaded per page
- **Caching** - Service Worker caches assets intelligently
- **Compression** - Minified CSS and JavaScript
- **CDN Ready** - Deploy on Cloudflare or similar

### Metrics
- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Offline Ready: Yes

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Report Issues
- Use [GitHub Issues](https://github.com/toolnest/issues)
- Include browser, OS, and steps to reproduce
- Provide error messages and screenshots

### Request Features
- Describe the use case
- Provide mockups or examples
- Consider performance impact

### Submit Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit changes (`git commit -am 'Add amazing tool'`)
4. Push to branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

### Code Guidelines
- Follow existing code style
- Add comments for complex logic
- Test across browsers
- Update documentation
- Ensure accessibility compliance

## 🧪 Testing

### Browser Testing
Tested on:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Automated Testing
```bash
# Run smoke tests
npm run smoke

# Run Puppeteer tests
npm run test:browser

# Manual testing
npm run test
```

## 📚 Documentation

### User Documentation
- [Support Page](support.html) - FAQs and troubleshooting
- [Privacy Policy](privacy-new.html) - Data handling
- [Terms of Service](terms.html) - Legal terms

### Developer Documentation
- [Code Comments](JS/main.js) - JSDoc documentation
- [Tool Implementation](tools/) - Tool-specific guides
- [API Reference](docs/API.md) - Function documentation

## 🎨 Customization

### Branding
Edit CSS variables in `styles-new.css`:
```css
:root {
  --accent-primary: #2563eb;
  --text-primary: #1a2a3e;
  /* ... more variables */
}
```

### Adding New Tools
1. Create HTML file in `tools/`
2. Create JS file in `JS/TOOLS-JS/`
3. Link from index page
4. Add to navigation

Example structure:
```html
<!-- tools/my-tool.html -->
<section class="tool-container">
  <input id="toolInput" type="file" />
  <button onclick="processTool()">Process</button>
  <div id="toolOutput"></div>
</section>

<script src="../JS/TOOLS-JS/my-tool.js"></script>
```

### Dark Mode
Automatically enabled based on system preference. CSS variables adapt:
```css
:root[data-theme="dark"] {
  --bg-primary: #0f1419;
  --text-primary: #f1f5f9;
  /* ... */
}
```

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Gourab Roy** - Initial development and maintenance
- **Community Contributors** - Feature requests and bug reports

## 🙏 Support

### Get Help
- 📧 Email: [hello@toolnest.example](mailto:hello@toolnest.example)
- 💬 Chat: [Support Page](support.html)
- 🐙 GitHub: [Issues](https://github.com/toolnest/issues)
- 🐦 Twitter: [@toolnest](https://twitter.com/toolnest)

### Donate
Help us keep ToolNest free and ad-free:
- [PayPal](https://paypal.me/toolnest)
- [Buy Me a Coffee](https://buymeacoffee.com/toolnest)

## 🔗 Links

- **Website:** [toolnest.example.com](https://toolnest.example.com)
- **GitHub:** [github.com/toolnest](https://github.com/toolnest)
- **Twitter:** [@toolnest](https://twitter.com/toolnest)
- **Support:** [support.toolnest.example](https://support.toolnest.example)

---

**Made with ❤️ by the ToolNest community**
