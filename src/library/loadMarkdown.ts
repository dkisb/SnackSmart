import fs from 'fs/promises';
import path from 'path';

export async function loadMarkdownData() {
  const dir = path.join(process.cwd(), 'src', 'data');
  const files = await fs.readdir(dir);

  let allContent = '';

  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(dir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      allContent += `\n\n---\n\n# File: ${file}\n\n${content}`;
    }
  }

  return allContent;
}
