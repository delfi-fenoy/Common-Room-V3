import { Component, OnInit } from '@angular/core';
import NotFoundItem from '../../models/NotFoundItem';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound implements OnInit{

  public randomImage: string = ''
  public randomPhrase: string = ''
  public randomRelese: string = ''

  private notFoundItems: NotFoundItem[] = [
    {
      imagePath: 'assets/img/errors/farquaad.jpg',
      phrase: "Estás más perdido que Lord Farquaad buscando altura.",
      relese: "Shrek (2001)"
    },
    {
      imagePath: 'assets/img/errors/obiwan.jpg',
      phrase: "Has perdido la conexión con la Fuerza... y con esta página.",
      relese: "Star Wars: Episode III - Revenge of the Sith (2005)"
    },
    {
      imagePath: 'assets/img/errors/obliviate.jpg',
      phrase: "Obliviate. Este rincón de la web ha sido borrado de tu memoria.",
      relese: "Harry Potter and the Deathly Hallows: Part 1 (2010)"
    },
    {
      imagePath: 'assets/img/errors/pensadero.png',
      phrase: "Has entrado a un recuerdo que ya no existe.",
      relese: "Fantastic Beasts: The Secrets of Dumbledore (2022)"
    },
    {
      imagePath: 'assets/img/errors/shrek.jpeg',
      phrase: "Esta página es como la cebolla: tiene capas... pero ninguna te da lo que buscas.",
      relese: "Shrek (2001)"
    },
    {
      imagePath: 'assets/img/errors/yoda.jpg',
      phrase: "El maestro Yoda dijo: 'Que tu búsqueda termine en otro lugar debe'.",
      relese: "Star Wars: Episode V - The Empire Strikes Back (1980)"
    }
  ]

  ngOnInit(): void {
    this.setRandomData()
  }

  setRandomData(){
    const index = Math.floor(Math.random() * this.notFoundItems.length)
    const selectedItem = this.notFoundItems[index]

    this.randomImage = selectedItem.imagePath
    this.randomPhrase = selectedItem.phrase
    this.randomRelese = selectedItem.relese
  }
}