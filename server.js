const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();

app.use(express.json());

app.post('/CPPCOMPILER', (req, res) => {
  const code = req.body.code;
  const tempFile = 'temp.cpp';
  const execFile = 'temp';

  fs.writeFileSync(tempFile, code);

  exec(`clang++ -std=c++17 -Wall -o ${execFile} ${tempFile}`, { timeout: 5000 }, (compileError, compileStdout, compileStderr) => {
    if (compileError) {
      fs.unlinkSync(tempFile);
      return res.json({ error: true, output: compileStderr || compileError.message });
    }

    exec(`${execFile}.exe`, { timeout: 5000 }, (runError, runOutput, runStderr) => {
      let output = runOutput || '';
      if (runError) {
        output += `\nRuntime Error: ${runError.message}\n${runStderr || ''}`;
      }

      fs.unlinkSync(tempFile);
      try { fs.unlinkSync(execFile); } catch (e) {}

      res.json({ error: !!runError, output: output || 'No output' });
    });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));