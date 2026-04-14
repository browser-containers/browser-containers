export {} // Make this file a module

// Mock dependencies for demo (in real implementation these would be properly imported)
interface MockVfsBus {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, content: Uint8Array): Promise<void>;
}

interface MockPackageManager {
  install(packages?: string[]): Promise<void>;
}

interface MockRuntimeWorker {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  runScript(code: string, options: { filename: string }): Promise<void>;
}

interface MockSandboxPool {
  run(code: string): Promise<{ result?: string; error?: string }>;
}

class MockVfsBus implements MockVfsBus {
  async exists(path: string): Promise<boolean> {
    return false;
  }
  async readFile(path: string): Promise<Uint8Array> {
    return new Uint8Array();
  }
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    console.log('Writing file:', path, content);
  }
}

class MockPackageManager implements MockPackageManager {
  async install(packages?: string[]): Promise<void> {
    console.log('Installing packages:', packages);
  }
}

class MockRuntimeWorker implements MockRuntimeWorker {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  async runScript(code: string, options: { filename: string }): Promise<void> {
    console.log('Running script:', options.filename, code);
  }
}

class MockSandboxPool implements MockSandboxPool {
  async run(code: string): Promise<{ result?: string; error?: string }> {
    return { result: 'Script executed successfully' };
  }
}

// Import types for proper TypeScript resolution
type VfsBus = MockVfsBus;
type PackageManager = MockPackageManager;
type RuntimeWorker = MockRuntimeWorker;
type SandboxPool = MockSandboxPool;

// In real implementation, these would be imported from the actual packages
const SWSandbox = {} as any;
const ShellService = {} as any;
const BrowserViteServer = {} as any;
const PreviewIframe = {} as any;

// Demo app initialization
async function bootDemo() {
  // Create DOM elements
  const container = document.createElement('div');
  container.className = 'demo-container';
  
  const commandInput = document.createElement('input');
  commandInput.type = 'text';
  commandInput.placeholder = 'Enter shell command (e.g., npm install, runtime run index.js)';
  commandInput.className = 'command-input';
  
  const runButton = document.createElement('button');
  runButton.textContent = 'Run';
  runButton.className = 'run-button';
  
  const output = document.createElement('div');
  output.className = 'output';
  output.style.whiteSpace = 'pre-wrap';
  output.style.minHeight = '100px';
  output.style.border = '1px solid #ccc';
  output.style.padding = '10px';
  output.style.marginTop = '10px';
  
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '400px';
  iframe.style.border = '1px solid #ccc';
  iframe.style.marginTop = '10px';
  
  container.appendChild(commandInput);
  container.appendChild(runButton);
  container.appendChild(output);
  container.appendChild(iframe);
  
  document.body.appendChild(container);
  
  // Create services
  const vfsBus = new MockVfsBus();
  const packageManager = new MockPackageManager();
  const runtimeWorker = new MockRuntimeWorker();
  const sandboxPool = new MockSandboxPool();
  
  const swSandbox = await SWSandbox.create({
    origin: 'https://sandbox.local/',
    swPath: '/sw-sandbox.js'
  });
  
  const shellService = new ShellService({
    vfs: vfsBus,
    packageManager,
    runtimeWorker,
    sandboxPool
  });
  
  const viteServer = new BrowserViteServer({
    vfs: vfsBus,
    root: '/project',
    hmrChannelName: 'vite-hmr'
  });
  
  await viteServer.start();
  
  swSandbox.onFetch(async (req: Request) => {
    const url = new URL(req.url);
    if (url.origin === 'https://sandbox.local/') {
      return viteServer.onFetch(url.pathname, req);
    }
    return new Response('Not found', { status: 404 });
  });
  
  const previewIframe = new PreviewIframe(iframe);
  previewIframe.loadUrl('https://sandbox.local/');
  
// Command execution
  runButton.addEventListener('click', async () => {
    const command = commandInput.value.trim();
    if (!command) return;
    
    output.textContent = `Executing: ${command}\n`;
    
    try {
      const result = await shellService.execute(command, {
        stdout: (data: string) => {
          output.textContent += data;
        },
        stderr: (data: string) => {
          output.textContent += data;
        }
      });
      
      output.textContent += `\nExit code: ${result.exitCode}`;
    } catch (error) {
      output.textContent += `\nError: ${error instanceof Error ? error.message : String(error)}`;
    }
  });

// Expose API to window
(window as any).__browserbox_ready = true;
(window as any).__browserbox = {
  install: (pkgs?: string[]) => shellService.exec(`npm install ${pkgs?.join(' ') || ''}`),
  vfs: {
    writeFile: (path: string, content: string) => vfsBus.writeFile(path, new TextEncoder().encode(content))
  },
  preview: {
    loadUrl: (url: string) => previewIframe.loadUrl(url)
  }
};

console.log('Demo app booted successfully');
}

// Start the demo
bootDemo().catch(console.error);