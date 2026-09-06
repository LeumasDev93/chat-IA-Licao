import { NextRequest, NextResponse } from 'next/server';
import { forceUpdateLesson } from '../scrape-lesson';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';

async function handle(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json(
      { success: false, message: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const lessonData = await forceUpdateLesson();

    return NextResponse.json({
      success: true,
      message: 'Lição atualizada com sucesso',
      data: lessonData,
    });
  } catch (error) {
    console.error('Erro ao atualizar lição:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao atualizar lição',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export const POST = handle;
export const GET = handle;
