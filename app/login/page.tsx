import { handleAuth } from "@/app/actions/handle-auth";
import { FaGoogle } from "react-icons/fa6";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-2">
      <div className="flex flex-col items-center justify-center text-center bg-gray-700 rounded-lg p-5 shadow-lg w-full sm:w-[400px]">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">
          Bem-Vindo ao Assistente IA para estudos da Lição da Escola Sabatina
        </h1>
        <span>Faça login para continuar</span>
        <form action={handleAuth}>
          <button
            type="submit"
            className="flex items-center justify-center gap-4 border-1 bg-gray-500 border-gray-700 rounded-lg mt-5 cursor-pointer px-4 py-2 hover:bg-gray-600"
          >
            <FaGoogle className="text-xl" /> Continuar com o Google
          </button>
        </form>
      </div>
    </div>
  );
}
