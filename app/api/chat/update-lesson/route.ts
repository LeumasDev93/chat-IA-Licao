import { NextResponse } from 'next/server';
import { forceUpdateLesson } from '../scrape-lesson';

export async function POST() {
  try {
    console.log('🔄 Iniciando atualização forçada da lição...');
    
    const lessonData = await forceUpdateLesson();
    
    return NextResponse.json({
      success: true,
      message: 'Lição atualizada com sucesso',
      data: lessonData
    });
    
  } catch (error) {
    console.error('Erro ao atualizar lição:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao atualizar lição',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔄 Iniciando atualização forçada da lição via GET...');
    
    const lessonData = await forceUpdateLesson();
    
    return NextResponse.json({
      success: true,
      message: 'Lição atualizada com sucesso',
      data: lessonData
    });
    
  } catch (error) {
    console.error('Erro ao atualizar lição:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao atualizar lição',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
