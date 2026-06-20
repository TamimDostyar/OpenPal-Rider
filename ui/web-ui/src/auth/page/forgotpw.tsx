

export const ForgotPW = () => {
  return (
    <section>
      <p>Enter your email to reset your password.</p>
      <form>
        <div>
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" placeholder="you@example.com" />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
    </section>
  );
};