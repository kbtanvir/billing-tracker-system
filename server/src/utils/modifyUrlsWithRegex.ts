export class Helper {
  static modifyUrlsWithRegex(htmlText: string, cdnUrl: string): string {
    // Ensure the CDN URL ends with a trailing slash (if not already present)
    if (!cdnUrl.endsWith('/')) {
      cdnUrl += '/';
    }

    const emptyHrefRegex = /<a\s+href\s*>(.*?)<\/a>/g;

    // Regex to match href that doesn't start with http, https, or double slashes
    const hrefRegex = /<a\s+[^>]*href="(?!http|https|\/\/)([^"]+)"/g;

    // Regex for assets like <img src="..." />, <script src="..." />, etc.
    const assetRegex =
      /(?:src|href)="(?!http|https|\/\/)([^"]+\.(?:js|css|png|jpg|jpeg|pdf|gif|svg|webp|mp4|mp3|wav))"/g;

    // Replace empty hrefs with a slash
    let modifiedHtml = htmlText.replace(emptyHrefRegex, (match, p1) => {
      return match.replace(p1, '/');
    });

    // Replace relative href in <a> tags with a leading slash if not present
    modifiedHtml = modifiedHtml.replace(hrefRegex, (match, p1) => {
      const updatedUrl = p1.startsWith('/') ? p1 : `/${p1}`;
      return match.replace(p1, updatedUrl);
    });

    // Replace relative asset URLs (src, href for assets) with CDN URL
    modifiedHtml = modifiedHtml.replace(assetRegex, (match, p1) => {
      // Ensure the CDN path includes the asset segment correctly
      const absoluteAssetUrl = new URL(p1, cdnUrl).href;
      return match.replace(p1, absoluteAssetUrl);
    });

    return modifiedHtml;
  }
}
