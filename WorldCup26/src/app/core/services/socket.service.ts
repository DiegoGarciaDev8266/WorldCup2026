import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {

  private socket: Socket;

  // Subjects — Observer Pattern
  private eventoPartidoSubject        = new Subject<any>();
  private partidoIniciadoSubject      = new Subject<any>();
  private marcadorActualizadoSubject  = new Subject<any>();
  private partidoProgramadoSubject    = new Subject<any>();
  private partidoActualizadoSubject   = new Subject<any>();

  eventoPartido$       = this.eventoPartidoSubject.asObservable();
  partidoIniciado$     = this.partidoIniciadoSubject.asObservable();
  marcadorActualizado$ = this.marcadorActualizadoSubject.asObservable();
  partidoProgramado$   = this.partidoProgramadoSubject.asObservable();
  partidoActualizado$  = this.partidoActualizadoSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
    });

    this.socket.on('evento-partido', (data: any) => {
      this.eventoPartidoSubject.next(data);
    });

    this.socket.on('partido-iniciado', (data: any) => {
      this.partidoIniciadoSubject.next(data);
    });

    this.socket.on('marcador-actualizado', (data: any) => {
      this.marcadorActualizadoSubject.next(data);
    });

    this.socket.on('partido-programado', (data: any) => {
      this.partidoProgramadoSubject.next(data);
    });

    this.socket.on('partido-actualizado', (data: any) => {
      this.partidoActualizadoSubject.next(data);
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}