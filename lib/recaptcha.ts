'use server';

/**
 * Verifies a Google reCAPTCHA v3 token.
 * @param token The reCAPTCHA token from the client.
 * @returns A promise that resolves to a boolean indicating if the user is human.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not set.");
    return false;
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verificationUrl, { method: 'POST' });
    if (!response.ok) {
        console.error("reCAPTCHA verification request failed:", response.statusText);
        return false;
    }
    
    const data = await response.json();
    
    // Check for success and a minimum score (e.g., 0.5)
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}
