import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotFoundItem } from '../../core/models';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './not-found.html',
    styleUrl: './not-found.css',
})
export class NotFound implements OnInit {
    // ! ======== Signals para el item seleccionado ========
    public selectedItem = signal<NotFoundItem | null>(null);

    // ! ======== Mapeo de items 404 ========
    private notFoundItems: NotFoundItem[] = [
        {
            imagePath: 'assets/img/errors/farquaad.jpg',
            phrase: 'Estás más perdido que Lord Farquaad buscando altura.',
            release: 'Shrek (2001)',
        },
        {
            imagePath: 'assets/img/errors/obiwan.jpg',
            phrase: 'Has perdido la conexión con la Fuerza... y con esta página.',
            release: 'Star Wars: Episode III - Revenge of the Sith (2005)',
        },
        {
            imagePath: 'assets/img/errors/obliviate.jpg',
            phrase: 'Obliviate. Este rincón de la web ha sido borrado de tu memoria.',
            release: 'Harry Potter and the Deathly Hallows: Part 1 (2010)',
        },
        {
            imagePath: 'assets/img/errors/pensadero.png',
            phrase: 'Has entrado a un recuerdo que ya no existe.',
            release: 'Fantastic Beasts: The Secrets of Dumbledore (2022)',
        },
        {
            imagePath: 'assets/img/errors/shrek.jpeg',
            phrase: 'Esta página es como la cebolla: tiene capas... pero ninguna te da lo que buscas.',
            release: 'Shrek (2001)',
        },
        {
            imagePath: 'assets/img/errors/yoda.jpg',
            phrase: "El maestro Yoda dijo: 'Que tu búsqueda termine en otro lugar debe'.",
            release: 'Star Wars: Episode V - The Empire Strikes Back (1980)',
        },
    ];

    ngOnInit(): void {
        this.setRandomData();
    }

    // ! ------ Método para seleccionar una frase/imagen aleatoria ------ */
    setRandomData(): void {
        const index = Math.floor(Math.random() * this.notFoundItems.length);
        this.selectedItem.set(this.notFoundItems[index]);
    }
}