export default function PreviewDiv({ htmlContent, ...props }) {
  return (
    <div {...props} dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
  );
}
