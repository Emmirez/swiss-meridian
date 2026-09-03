const WHATSAPP_NUMBER = "18633339415";

const FloatingWhatsApp = () => {
  return (
    
    <a  href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#25D366] shadow-lg hover:scale-105 transition-transform flex items-center justify-center group"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 3C9.383 3 4 8.373 4 14.99c0 2.31.638 4.47 1.746 6.32L4 29l7.86-1.71a12.94 12.94 0 0 0 4.144.68C22.62 27.97 28 22.6 28 15.98 28 9.37 22.62 3 16.004 3zm0 23.4c-1.34 0-2.65-.24-3.87-.71l-.278-.104-4.665 1.015 1.03-4.53-.182-.288A10.35 10.35 0 0 1 6.5 14.99C6.5 9.76 10.77 5.5 16.004 5.5c5.234 0 9.496 4.26 9.496 9.49 0 5.23-4.262 9.41-9.496 9.41z" />
        <path d="M21.62 17.66c-.286-.144-1.69-.834-1.953-.93-.262-.096-.454-.144-.646.144-.19.288-.742.93-.91 1.122-.166.192-.334.216-.62.072-.286-.144-1.207-.445-2.3-1.42-.85-.757-1.424-1.692-1.59-1.98-.166-.288-.018-.444.126-.588.13-.13.286-.336.43-.504.144-.168.19-.288.286-.48.096-.192.048-.36-.024-.504-.072-.144-.646-1.556-.886-2.13-.234-.562-.472-.486-.646-.494l-.55-.01c-.192 0-.504.072-.766.36-.262.288-1.003.98-1.003 2.39s1.027 2.77 1.17 2.96c.144.192 2.02 3.084 4.895 4.324.684.294 1.218.47 1.634.6.686.218 1.31.187 1.804.114.55-.082 1.69-.69 1.928-1.356.238-.666.238-1.238.166-1.356-.072-.12-.262-.192-.548-.336z" />
      </svg>
      <span className="absolute right-full mr-3 whitespace-nowrap bg-navy-900 text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </span>
    </a>
  );
};

export default FloatingWhatsApp;