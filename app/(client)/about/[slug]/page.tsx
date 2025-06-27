// app/(client)/about/[slug]/page.tsx
import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

export default async function AboutSlugPage({
  params
}: {
  params: Promise<{ slug: string }>  // Changed: Promise wrapper
}) {
  const { slug } = await params;  // Changed: await params
  
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), `app/content/about/${slug}.json`);
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
    // If the file is not found or there's an error, show 404
    return notFound();
  }
}