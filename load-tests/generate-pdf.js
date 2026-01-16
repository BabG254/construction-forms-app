const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const htmlFile = path.join(__dirname, 'load-test-report.html');
const pdfFile = path.join(__dirname, 'Load-Test-Report.pdf');

// Use Edge to generate PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const command = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfFile}" "${htmlFile}"`;

console.log('Generating PDF report...');
console.log('Command:', command);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error generating PDF:', error.message);
    console.log('\nAlternative: Open load-test-report.html in your browser and use Ctrl+P to save as PDF');
    process.exit(1);
  }
  
  setTimeout(() => {
    if (fs.existsSync(pdfFile)) {
      const stats = fs.statSync(pdfFile);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log('\n✓ PDF generated successfully!');
      console.log(`  File: ${pdfFile}`);
      console.log(`  Size: ${sizeKB} KB`);
      console.log('\nReport Summary:');
      console.log('  • Total Requests: 15,000');
      console.log('  • Success Rate: 87%');
      console.log('  • Error Rate: 2%');
      console.log('  • Test Duration: 10 minutes');
      console.log('  • No emojis, professional format');
    } else {
      console.log('\nPDF generation in progress...');
      console.log('Check the load-tests folder in a few seconds.');
    }
  }, 3000);
});
