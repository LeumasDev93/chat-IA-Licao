"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "pt" | "en" | "es" | "fr" | "krioulu";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Traduções para diferentes idiomas
const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Interface
    new_conversation: "Nova Conversa",
    history: "Histórico",
    settings: "Configurações",
    logout: "Sair",
    login: "Entrar",
    my_account: "Minha Conta",
    contact_us: "Contacte-nos",
    language: "Idioma",
    theme: "Tema",
    general: "Geral",
    about: "Sobre Nós",
    version: "Versão",
    terms_of_service: "Termos de Serviço",
    contact: "Contato",
    portuguese: "Português",
    english: "Inglês",
    spanish: "Espanhol",
    french: "Francês",
    krioulu: "Krioulu",

    // Chat
    type_message: "Digite sua mensagem...",
    login_to_send: "Faça login para enviar mensagens...",
    send: "Enviar",
    voice_recording: "Gravação de voz",

    // Quick replies
    saturday_afternoon: "Sábado à tarde",
    sunday: "Domingo",
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    auxiliary: "Auxiliar",
    commentary: "Comentário",
    weekly_summary: "Resumo Semanal",

    // Footer
    ai_assistant_warning:
      "O Assistente IA para estudos da lição pode cometer erros. Verifique informações importantes.",
    copyright: "Copyright ©",
    developed_by: "desenvolvido por",

    // Modal
    access_blocked: "Acesso Bloqueado",
    login_to_unlock: "Inicie sessão para desbloquear:",
    intelligent_responses: "Respostas inteligentes e personalizadas",
    complete_history: "Histórico completo das suas conversas",
    priority_access: "Acesso prioritário a novos recursos",
    login_now: "Iniciar Sessão Agora",
    takes_less_than_30_seconds: "Leva menos de 30 segundos!",

    // AI Assistant
    ai_assistant_title: "Assistente IA - Escola Sabatina",
    ai_assistant_description:
      "Esta é a Inteligência Artificial oficial da Igreja Adventista do Sétimo Dia Em Cabo Verde, desenvolvida para apoiar nos estudos da lição da escola sabatina, inspirar e fortalecer sua jornada espiritual.",

    // Login/Register
    welcome_back: "Bem-Vindo(a) de volta ao",
    ai_assistant: "Assistente IA",
    login_to_continue: "Faça login para continuar",
    create_free_account: "Crie sua conta gratuitamente",
    sign_in: "Entrar",
    create_account: "Criar Conta",
    full_name: "Nome completo",
    email: "Email",
    password: "Senha",
    sign_in_button: "Entrar",
    create_account_button: "Criar Conta",
    or: "ou",
    continue_with_google: "Continuar com Google",
    no_account: "Não tem uma conta? ",
    already_have_account: "Já tem uma conta? ",
    create_now: "Crie agora",
    make_login: "Faça login",

    // Chat History
    conversation_history: "Histórico de Conversas",
    search_conversations: "Buscar conversas...",
    no_conversations_found: "Nenhuma conversa encontrada",
    no_conversations_yet: "Nenhuma conversa ainda",
    edit_title: "Editar título",
    more_options: "Mais opções",
    delete_conversation: "Deletar conversa",
    conversations_count: "conversa",
    conversations_count_plural: "conversas",
    no_messages: "Nenhuma mensagem",
    invalid_date: "Data inválida",

    // Typing Indicator
    typing: "respondendo...",
  },

  en: {
    // Interface
    new_conversation: "New Conversation",
    history: "History",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    my_account: "My Account",
    contact_us: "Contact Us",
    language: "Language",
    theme: "Theme",
    general: "General",
    about: "About",
    version: "Version",
    terms_of_service: "Terms of Service",
    contact: "Contact",
    portuguese: "Portuguese",
    english: "English",
    spanish: "Spanish",
    french: "French",
    krioulu: "Krioulu",

    // Chat
    type_message: "Type your message...",
    login_to_send: "Login to send messages...",
    send: "Send",
    voice_recording: "Voice recording",

    // Quick replies
    saturday_afternoon: "Saturday afternoon",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    auxiliary: "Auxiliary",
    commentary: "Commentary",
    weekly_summary: "Weekly Summary",

    // Footer
    ai_assistant_warning:
      "The AI Assistant for lesson studies may make errors. Verify important information.",
    copyright: "Copyright ©",
    developed_by: "developed by",

    // Modal
    access_blocked: "Access Blocked",
    login_to_unlock: "Login to unlock:",
    intelligent_responses: "Intelligent and personalized responses",
    complete_history: "Complete history of your conversations",
    priority_access: "Priority access to new features",
    login_now: "Login Now",
    takes_less_than_30_seconds: "Takes less than 30 seconds!",

    // AI Assistant
    ai_assistant_title: "AI Assistant - Sabbath School",
    ai_assistant_description:
      "This is the official Artificial Intelligence of the Seventh-day Adventist Church in Cape Verde, developed to support Sabbath School lesson studies, inspire and strengthen your spiritual journey.",

    // Login/Register
    welcome_back: "Welcome back to",
    ai_assistant: "AI Assistant",
    login_to_continue: "Sign in to continue",
    create_free_account: "Create your free account",
    sign_in: "Sign In",
    create_account: "Create Account",
    full_name: "Full name",
    email: "Email",
    password: "Password",
    sign_in_button: "Sign In",
    create_account_button: "Create Account",
    or: "or",
    continue_with_google: "Continue with Google",
    no_account: "Don't have an account? ",
    already_have_account: "Already have an account? ",
    create_now: "Create now",
    make_login: "Sign in",

    // Chat History
    conversation_history: "Conversation History",
    search_conversations: "Search conversations...",
    no_conversations_found: "No conversations found",
    no_conversations_yet: "No conversations yet",
    edit_title: "Edit title",
    more_options: "More options",
    delete_conversation: "Delete conversation",
    conversations_count: "conversation",
    conversations_count_plural: "conversations",
    no_messages: "No messages",
    invalid_date: "Invalid date",

    // Typing Indicator
    typing: "responding...",
  },

  es: {
    // Interface
    new_conversation: "Nueva Conversación",
    history: "Historial",
    settings: "Configuración",
    logout: "Cerrar Sesión",
    login: "Iniciar Sesión",
    my_account: "Mi Cuenta",
    contact_us: "Contáctanos",
    language: "Idioma",
    theme: "Tema",
    general: "General",
    about: "Acerca de",
    version: "Versión",
    terms_of_service: "Términos de Servicio",
    contact: "Contacto",
    portuguese: "Portugués",
    english: "Inglés",
    spanish: "Español",
    french: "Francés",
    krioulu: "Krioulu",

    // Chat
    type_message: "Escribe tu mensaje...",
    login_to_send: "Inicia sesión para enviar mensajes...",
    send: "Enviar",
    voice_recording: "Grabación de voz",

    // Quick replies
    saturday_afternoon: "Sábado por la tarde",
    sunday: "Domingo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    auxiliary: "Auxiliar",
    commentary: "Comentario",
    weekly_summary: "Resumen Semanal",

    // Footer
    ai_assistant_warning:
      "El Asistente IA para estudios de lecciones puede cometer errores. Verifica información importante.",
    copyright: "Copyright ©",
    developed_by: "desarrollado por",

    // Modal
    access_blocked: "Acceso Bloqueado",
    login_to_unlock: "Inicia sesión para desbloquear:",
    intelligent_responses: "Respuestas inteligentes y personalizadas",
    complete_history: "Historial completo de tus conversaciones",
    priority_access: "Acceso prioritario a nuevas funciones",
    login_now: "Iniciar Sesión Ahora",
    takes_less_than_30_seconds: "¡Toma menos de 30 segundos!",

    // AI Assistant
    ai_assistant_title: "Asistente IA - Escuela Sabática",
    ai_assistant_description:
      "Esta es la Inteligencia Artificial oficial de la Iglesia Adventista del Séptimo Día en Cabo Verde, desarrollada para apoyar los estudios de lecciones de la Escuela Sabática, inspirar y fortalecer tu jornada espiritual.",

    // Login/Register
    welcome_back: "Bienvenido(a) de vuelta al",
    ai_assistant: "Asistente IA",
    login_to_continue: "Inicia sesión para continuar",
    create_free_account: "Crea tu cuenta gratuitamente",
    sign_in: "Iniciar Sesión",
    create_account: "Crear Cuenta",
    full_name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    sign_in_button: "Iniciar Sesión",
    create_account_button: "Crear Cuenta",
    or: "o",
    continue_with_google: "Continuar con Google",
    no_account: "¿No tienes una cuenta? ",
    already_have_account: "¿Ya tienes una cuenta? ",
    create_now: "Crea ahora",
    make_login: "Inicia sesión",

    // Chat History
    conversation_history: "Historial de Conversaciones",
    search_conversations: "Buscar conversaciones...",
    no_conversations_found: "No se encontraron conversaciones",
    no_conversations_yet: "Aún no hay conversaciones",
    edit_title: "Editar título",
    more_options: "Más opciones",
    delete_conversation: "Eliminar conversación",
    conversations_count: "conversación",
    conversations_count_plural: "conversaciones",
    no_messages: "Sin mensajes",
    invalid_date: "Fecha inválida",

    // Typing Indicator
    typing: "respondiendo...",
  },

  fr: {
    // Interface
    new_conversation: "Nouvelle Conversation",
    history: "Historique",
    settings: "Paramètres",
    logout: "Déconnexion",
    login: "Connexion",
    my_account: "Mon Compte",
    contact_us: "Contactez-nous",
    language: "Langue",
    theme: "Thème",
    general: "Général",
    about: "À propos",
    version: "Version",
    terms_of_service: "Conditions de Service",
    contact: "Contact",
    portuguese: "Portugais",
    english: "Anglais",
    spanish: "Espagnol",
    french: "Français",
    krioulu: "Krioulu",

    // Chat
    type_message: "Tapez votre message...",
    login_to_send: "Connectez-vous pour envoyer des messages...",
    send: "Envoyer",
    voice_recording: "Enregistrement vocal",

    // Quick replies
    saturday_afternoon: "Samedi après-midi",
    sunday: "Dimanche",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    auxiliary: "Auxiliaire",
    commentary: "Commentaire",
    weekly_summary: "Résumé Hebdomadaire",

    // Footer
    ai_assistant_warning:
      "L'Assistant IA pour les études de leçons peut faire des erreurs. Vérifiez les informations importantes.",
    copyright: "Copyright ©",
    developed_by: "développé par",

    // Modal
    access_blocked: "Accès Bloqué",
    login_to_unlock: "Connectez-vous pour débloquer:",
    intelligent_responses: "Réponses intelligentes et personnalisées",
    complete_history: "Historique complet de vos conversations",
    priority_access: "Accès prioritaire aux nouvelles fonctionnalités",
    login_now: "Se Connecter Maintenant",
    takes_less_than_30_seconds: "Prend moins de 30 secondes!",

    // AI Assistant
    ai_assistant_title: "Assistant IA - École du Sabbat",
    ai_assistant_description:
      "Ceci est l'Intelligence Artificielle officielle de l'Église Adventiste du Septième Jour au Cap-Vert, développée pour soutenir les études de leçons de l'École du Sabbat, inspirer et renforcer votre parcours spirituel.",

    // Login/Register
    welcome_back: "Bienvenue de retour à",
    ai_assistant: "Assistant IA",
    login_to_continue: "Connectez-vous pour continuer",
    create_free_account: "Créez votre compte gratuitement",
    sign_in: "Se Connecter",
    create_account: "Créer un Compte",
    full_name: "Nom complet",
    email: "Email",
    password: "Mot de passe",
    sign_in_button: "Se Connecter",
    create_account_button: "Créer un Compte",
    or: "ou",
    continue_with_google: "Continuer avec Google",
    no_account: "Vous n'avez pas de compte? ",
    already_have_account: "Vous avez déjà un compte? ",
    create_now: "Créez maintenant",
    make_login: "Connectez-vous",

    // Chat History
    conversation_history: "Historique des Conversations",
    search_conversations: "Rechercher des conversations...",
    no_conversations_found: "Aucune conversation trouvée",
    no_conversations_yet: "Aucune conversation encore",
    edit_title: "Modifier le titre",
    more_options: "Plus d'options",
    delete_conversation: "Supprimer la conversation",
    conversations_count: "conversation",
    conversations_count_plural: "conversations",
    no_messages: "Aucun message",
    invalid_date: "Date invalide",

    // Typing Indicator
    typing: "respondendo...",
  },

  krioulu: {
    // Interface
    new_conversation: "Nova Konbersa",
    history: "Istoria",
    settings: "Konfigurason",
    logout: "Sai",
    login: "Entra",
    my_account: "Nha Konta",
    contact_us: "Kontaktu ku nos",
    language: "Lingua",
    theme: "Tema",
    general: "Geral",
    about: "Sobre",
    version: "Verson",
    terms_of_service: "Termus di Servisu",
    contact: "Kontaktu",
    portuguese: "Portuges",
    english: "Ingles",
    spanish: "Espanhol",
    french: "Franses",
    krioulu: "Krioulu",

    // Chat
    type_message: "Skrebi bu mensajen...",
    login_to_send: "Entra pa manda mensajen...",
    send: "Manda",
    voice_recording: "Gravason di vos",

    // Quick replies
    saturday_afternoon: "Sabadu tardi",
    sunday: "Dumingu",
    monday: "Segunda",
    tuesday: "Tersa",
    wednesday: "Kuarta",
    thursday: "Kinta",
    friday: "Sesta",
    auxiliary: "Auxiliar",
    commentary: "Komentariu",
    weekly_summary: "Resumu Semanal",

    // Footer
    ai_assistant_warning:
      "Asistente IA pa studu di lison pode faze erus. Verifika informason importante.",
    copyright: "Copyright ©",
    developed_by: "desenvolvidu pa",

    // Modal
    access_blocked: "Aksu Blokeadu",
    login_to_unlock: "Entra pa desblokea:",
    intelligent_responses: "Resposta inteligenti i personalizadu",
    complete_history: "Istoria kompletu di bu konbersa",
    priority_access: "Aksu prioritariu pa funson nobu",
    login_now: "Entra Agora",
    takes_less_than_30_seconds: "Toma menus di 30 segundu!",

    // AI Assistant
    ai_assistant_title: "Asistente IA - Skola Sabadu",
    ai_assistant_description:
      "Es e a Inteligensia Artifisial ofisial di Igreja Adventista di Setimu Dia na Kabu Verdi, desenvolvidu pa apoia studu di lison di skola sabadu, inspira i fortesi bu jornada espiritual.",

    // Login/Register
    welcome_back: "Bem-vindu di volta pa",
    ai_assistant: "Asistente IA",
    login_to_continue: "Entra pa kontinua",
    create_free_account: "Kria bu konta gratuitamente",
    sign_in: "Entra",
    create_account: "Kria Konta",
    full_name: "Nomi kompletu",
    email: "Email",
    password: "Palavra-pas",
    sign_in_button: "Entra",
    create_account_button: "Kria Konta",
    or: "o",
    continue_with_google: "Kontinua ku Google",
    no_account: "Ka ten konta? ",
    already_have_account: "Ja ten konta? ",
    create_now: "Kria agora",
    make_login: "Entra",

    // Chat History
    conversation_history: "Istoria di Konbersa",
    search_conversations: "Buska konbersa...",
    no_conversations_found: "Ka ten konbersa enkontradu",
    no_conversations_yet: "Ainda ka ten konbersa",
    edit_title: "Edita titulu",
    more_options: "Mais opson",
    delete_conversation: "Apaga konbersa",
    conversations_count: "konbersa",
    conversations_count_plural: "konbersa",
    no_messages: "Ka ten mensajen",
    invalid_date: "Data invalida",

    // Typing Indicator
    typing: "respondendu...",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("pt");

  // Carrega o idioma salvo no localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("app_language") as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Salva o idioma no localStorage quando mudar
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
  };

  // Função de tradução
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
