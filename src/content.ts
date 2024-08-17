import JSZip from 'jszip';
import { TargetFile } from './types';

const targetSelector = '.results .table-header span';

function injectDownloadButton() {
  const component = document.querySelector(targetSelector) as HTMLElement;
  if (!component) {
    console.error('Target component not found.');
    return;
  }

  const button = document.createElement('a');
  button.textContent = '下載全部';
  button.type = 'button';
  // Render button right after sort select
  button.style.float = 'left';
  button.style.marginLeft = '16px';
  // Styling
  button.className = 'btnHelp';
  button.href = '#';

  
  component.insertAdjacentElement('afterend', button);
  
  const handleLoading = () => {
    button.style.pointerEvents = 'none';
    button.style.cursor = 'default';
    button.textContent = '讀取中....';
  }

  const handleDone = () => {
    button.style.pointerEvents = '';
    button.style.cursor = '';
    button.textContent = '下載全部';
  }

  button.addEventListener('click', async () => {
    handleLoading();

    await downloadZippedFiles(getFiles());
    handleDone();
  });
}

function getFiles() {
  const files: TargetFile[] = [];
  document.querySelectorAll(`.results table a`).forEach((element) => {
    if(element instanceof HTMLAnchorElement && !!element.textContent){
      const file: TargetFile = {
        title: element.textContent.replace(/\s+/g, ''),
        url: element.href,
      }
      files.push(file);
    }
  });
  return files;
}

async function downloadZippedFiles(files: TargetFile[]) {
  const zip = new JSZip();

  async function addFileToZip(file: TargetFile) {
    const response = await fetch(file.url);
    const blob = await response.blob();
    return zip.file(file.title, blob);
  }

  try {
    await Promise.all(files.map((file) => addFileToZip(file)));
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${formattedDate}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
  }
}

function formattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

injectDownloadButton();
