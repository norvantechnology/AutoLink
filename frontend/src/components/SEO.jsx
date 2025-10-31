import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seoConfig from '../config/seo';

/**
 * SEO Component - Dynamically manages meta tags for each page
 * Usage: <SEO page="home" /> or <SEO page="login" />
 */
function SEO({ page = 'home', customTitle, customDescription, customImage }) {
  const location = useLocation();
  const pageConfig = seoConfig.pages[page] || seoConfig.pages.home;
  const defaultConfig = seoConfig.default;

  // Use custom values if provided, otherwise use config
  const title = customTitle || pageConfig.title;
  const description = customDescription || pageConfig.description;
  const keywords = pageConfig.keywords;
  const url = `${defaultConfig.siteUrl}${pageConfig.path}`;
  const image = customImage || defaultConfig.defaultImage;
  const robots = pageConfig.robots || 'index, follow';

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector, attribute, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const attr = selector.includes('property') ? 'property' : 'name';
        const value = selector.split(/\[|\]|="/)[1].split('"')[0];
        element.setAttribute(attr, value);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="robots"]', 'content', robots);
    updateMetaTag('meta[name="author"]', 'content', defaultConfig.siteName);

    // Open Graph (Facebook, LinkedIn)
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', url);
    updateMetaTag('meta[property="og:type"]', 'content', pageConfig.ogType || 'website');
    updateMetaTag('meta[property="og:image"]', 'content', image);
    updateMetaTag('meta[property="og:image:width"]', 'content', defaultConfig.imageWidth);
    updateMetaTag('meta[property="og:image:height"]', 'content', defaultConfig.imageHeight);
    updateMetaTag('meta[property="og:site_name"]', 'content', defaultConfig.siteName);
    updateMetaTag('meta[property="og:locale"]', 'content', defaultConfig.locale);

    // Twitter Card
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:site"]', 'content', defaultConfig.twitterHandle);
    updateMetaTag('meta[name="twitter:creator"]', 'content', defaultConfig.twitterHandle);
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:image"]', 'content', image);

    // Additional SEO tags
    updateMetaTag('meta[name="theme-color"]', 'content', '#0077b5');
    updateMetaTag('meta[name="apple-mobile-web-app-capable"]', 'content', 'yes');
    updateMetaTag('meta[name="apple-mobile-web-app-status-bar-style"]', 'content', 'default');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // JSON-LD Structured Data
    const updateStructuredData = (id, data) => {
      let script = document.querySelector(`script[id="${id}"]`);
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('id', id);
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    };

    // Add organization structured data on home page
    if (page === 'home') {
      updateStructuredData('structured-data-organization', seoConfig.structuredData.organization);
      updateStructuredData('structured-data-website', seoConfig.structuredData.website);
      updateStructuredData('structured-data-software', seoConfig.structuredData.softwareApplication);
    }

    // Cleanup function
    return () => {
      // Optional: Remove structured data when component unmounts
      if (page === 'home') {
        const scripts = ['structured-data-organization', 'structured-data-website', 'structured-data-software'];
        scripts.forEach(id => {
          const script = document.querySelector(`script[id="${id}"]`);
          if (script) script.remove();
        });
      }
    };
  }, [page, title, description, keywords, url, image, robots, pageConfig.ogType, defaultConfig]);

  // This component doesn't render anything
  return null;
}

export default SEO;

