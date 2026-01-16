const fs = require('fs');
const path = require('path');

/**
 * Artillery report generator
 * Generates a professional HTML report from Artillery JSON results
 */

function generateHTMLReport(jsonResultPath, outputPath) {
  try {
    // Read the Artillery JSON results
    const jsonData = JSON.parse(fs.readFileSync(jsonResultPath, 'utf8'));
    
    // Read the HTML template
    const templatePath = path.join(__dirname, 'report-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Inject the test data into the HTML
    const dataScript = `
    <script>
      window.LOAD_TEST_DATA = ${JSON.stringify(jsonData, null, 2)};
      
      // Auto-populate the report when page loads
      if (window.LOAD_TEST_DATA) {
        window.addEventListener('DOMContentLoaded', function() {
          populateReport(window.LOAD_TEST_DATA);
        });
      }
    </script>
    `;
    
    // Insert the data script before the closing body tag
    htmlTemplate = htmlTemplate.replace('</body>', dataScript + '</body>');
    
    // Write the final HTML report
    fs.writeFileSync(outputPath, htmlTemplate, 'utf8');
    
    console.log(`\n✅ HTML Report generated successfully!`);
    console.log(`📄 Report location: ${outputPath}`);
    console.log(`\n🌐 Open the report in your browser to view the results.\n`);
    
    return true;
  } catch (error) {
    console.error('Error generating HTML report:', error.message);
    return false;
  }
}

// Check if being run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node generate-report.js <input-json> <output-html>');
    console.log('Example: node generate-report.js results.json report.html');
    process.exit(1);
  }
  
  const [inputPath, outputPath] = args;
  generateHTMLReport(inputPath, outputPath);
}

module.exports = { generateHTMLReport };
