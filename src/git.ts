import { exec } from './exec';
import { Author } from './extension';
import * as vscode from 'vscode';


function getWorkspaceDir(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length === 1) {
        return folders[0].uri.fsPath;
    }
}

async function getGitConfigEntry(key: string, repoDir?: string): Promise<string> {
    const { stdout, stderr } = await exec(`git config --get ${key}`, { timeout: 1000, windowsHide: true, cwd: repoDir });
    // TODO: error handling
    return stdout.replace('\r', '').replace('\n', '');
}

function setGitConfigEntry(key: string, value: string, repoDir?: string): Promise<{}> {
    const location = repoDir ? 'local' : 'global';
    return exec(`git config --${location} ${key} "${value.replace('"', '""')}"`, { timeout: 1000, windowsHide: true, cwd: repoDir });
}

export function getCurrentUser(): Promise<Author> {
    const repoDir = getWorkspaceDir();
    return Promise.all([
        getGitConfigEntry('user.name', repoDir),
        getGitConfigEntry('user.email', repoDir)
    ]).then(([name, email]) => ({ name, email }));
}

export async function setCurrentUser(author: Author): Promise<void> {
    const repoDir = getWorkspaceDir();
    await setGitConfigEntry('user.name', author.name, repoDir);
    await setGitConfigEntry('user.email', author.email, repoDir);
}
