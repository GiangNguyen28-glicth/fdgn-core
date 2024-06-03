import { Controller, Get, Inject, OnModuleInit, Param, UseFilters } from '@nestjs/common';
import { ClientGrpc, GrpcMethod, GrpcStreamMethod, RpcException } from '@nestjs/microservices';
import { Observable, ReplaySubject, Subject, lastValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { status as Status } from '@grpc/grpc-js';

import { AppExceptionsFilter } from 'libs/common/dist';
import { HeroById } from './interfaces/hero-by-id.interface';
import { Hero } from './interfaces/hero.interface';

interface HeroesService {
  findOne(data: HeroById): Observable<Hero>;
  findMany(upstream: Observable<HeroById>): Observable<Hero>;
}

@Controller('hero')
export class HeroController implements OnModuleInit {
  private readonly items: Hero[] = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
  ];
  private heroesService: HeroesService;

  constructor(@Inject('HERO_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  @Get()
  getMany(): Observable<Hero[]> {
    const ids$ = new ReplaySubject<HeroById>();
    ids$.next({ id: 1 });
    ids$.next({ id: 2 });
    ids$.complete();

    const stream = this.heroesService.findMany(ids$.asObservable());
    return stream.pipe(toArray());
  }

  @Get(':id')
  getById(@Param('id') id: string): any {
    try {
      return lastValueFrom(this.heroesService.findOne({ id: +id }));
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }
  }

  @GrpcMethod('HeroesService')
  findOne(data: HeroById): any {
    console.log('Zo day');
    throw new RpcException({ code: Status.NOT_FOUND, message: 'OK' });
  }

  @GrpcStreamMethod('HeroesService')
  findMany(data$: Observable<HeroById>): Observable<Hero> {
    const hero$ = new Subject<Hero>();

    const onNext = (heroById: HeroById) => {
      const item = this.items.find(({ id }) => id === heroById.id);
      hero$.next(item || { id: 1, name: 'John' });
    };
    const onComplete = () => hero$.complete();
    data$.subscribe({
      next: onNext,
      complete: onComplete,
    });

    return hero$.asObservable();
  }
}
