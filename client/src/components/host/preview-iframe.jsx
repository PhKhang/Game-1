export default function PreviewIFrame({ htmlContent, ...props }) {
  // Define the complete HTML structure here
  const completeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>body {
		font-family: Arial, sans-serif;
		background-color: #f0f0f0;
		color: #333;
	}
	p {
		font-size: 16px;
		line-height: 1.5;
	}</style>
          </head>
          <body>
            ${htmlContent || ""}
          </body>
        </html>
      `;

  return <iframe {...props} width={600} height={450} srcDoc={completeHtml} />;
}
