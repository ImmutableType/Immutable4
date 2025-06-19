// app/(client)/about/page.tsx
import { promises as fs } from 'fs';
import path from 'path';

export default async function AboutPage() {
  // Read the JSON file
  try {
    const filePath = path.join(process.cwd(), 'app/content/about/about.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return (
      <div className="about-page">
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          fontFamily: "'Special Elite', monospace"
        }}>
          {data.title}
        </h1>
        
        {data.sections && data.sections.map((section: any, index: number) => (
          <div key={index} style={{ marginBottom: '24px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              fontFamily: "'Special Elite', monospace"
            }}>
              {section.heading}
            </h2>
            <p style={{ lineHeight: '1.6' }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    // If there's an error loading the JSON, display a fallback
    return (
      <div className="about-page">
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          fontFamily: "'Special Elite', monospace"
        }}>
          About ImmutableType
        </h1>
        <p>Welcome to ImmutableType, the decentralized journalism platform built on the Flow blockchain.</p>
      </div>
    );
  }
}