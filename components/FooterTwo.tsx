export function FooterTwo() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full md:mt-10">
      <div className="w-full pb-5 text-center text-sm">
        <span>
          Copyright © {currentYear} | desenvolvido por
          <span className="text-blue-400/70"> Leumas Andrade</span>
        </span>
      </div>
    </footer>
  );
}
