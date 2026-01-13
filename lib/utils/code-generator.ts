const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
}

export async function generateUniqueCode(
  checkExists: (code: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode();
    const exists = await checkExists(code);
    if (!exists) {
      return code;
    }
  }
  throw new Error('Failed to generate unique code after maximum attempts');
}
