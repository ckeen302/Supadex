'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { debounce } from 'lodash'

interface TCGCard {
  id: string
  name: string
  supertype: string
  subtypes: string[]
  hp?: string
  types?: string[]
  images: {
    small: string
    large: string
  }
  tcgplayer?: {
    url: string
    updatedAt: string
    prices: {
      holofoil?: { market: number, directLow: number }
      reverseHolofoil?: { market: number, directLow: number }
      normal?: { market: number, directLow: number }
      '1stEditionHolofoil'?: { market: number, directLow: number }
      unlimitedHolofoil?: { market: number, directLow: number }
    }
  }
  cardmarket?: {
    url: string
    updatedAt: string
    prices: {
      averageSellPrice: number
      lowPrice: number
      trendPrice: number
      germanProLow: number
      suggestedPrice: number
      reverseHoloSell: number
      reverseHoloLow: number
      reverseHoloTrend: number
      lowPriceExPlus: number
      avg1: number
      avg7: number
      avg30: number
      reverseHoloAvg1: number
      reverseHoloAvg7: number
      reverseHoloAvg30: number
    }
  }
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    legalities: { [key: string]: string }
    ptcgoCode?: string
    releaseDate: string
    updatedAt: string
    images: {
      symbol: string
      logo: string
    }
  }
  number: string
  artist?: string
  rarity?: string
  flavorText?: string
  nationalPokedexNumbers?: number[]
  legalities: { [key: string]: string }
  regulationMark?: string
  abilities?: Array<{
    name: string
    text: string
    type: string
  }>
  attacks?: Array<{
    name: string
    cost: string[]
    convertedEnergyCost: number
    damage: string
    text: string
  }>
  weaknesses?: Array<{
    type: string
    value: string
  }>
  resistances?: Array<{
    type: string
    value: string
  }>
  retreatCost?: string[]
  priceHistory?: {
    date: string;
    price: number;
  }[];
}

interface TCGSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  legalities: { [key: string]: string }
  ptcgoCode?: string
  releaseDate: string
  updatedAt: string
  images: {
    symbol: string
    logo: string
  }
}

const CARD_TYPES = [
  'All',
  'Pokémon',
  'Trainer',
  'Energy'
] as const

type CardType = typeof CARD_TYPES[number]

type SortOrder = 'none' | 'price-asc' | 'price-desc' | 'number-asc' | 'number-desc' | 'name-asc' | 'name-desc' | 'type-asc' | 'type-desc' | 'rarity-asc' | 'rarity-desc';

const generateMockPriceHistory = (currentPrice: number): { date: string; price: number }[] => {
  if (!currentPrice || isNaN(currentPrice)) return [];
  
  const history = [];
  const today = new Date();
  // Generate 365 days of price history
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // Create more realistic price variations
    const volatility = 0.15; // 15% maximum price swing
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const trendFactor = 1 + (i / 365) * 0.1; // Slight upward trend over time
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number((currentPrice * randomFactor * trendFactor).toFixed(2))
    });
  }
  return history;
};

//Removed getHighestPrice function

const getRelevantPrice = (card: TCGCard): { price: number, source: string } => {
  // TCGplayer prices
  if (card.tcgplayer?.prices) {
    const { normal, holofoil, reverseHolofoil, '1stEditionHolofoil': firstEdition } = card.tcgplayer.prices;
    if (normal?.market && !isNaN(normal.market)) return { price: Number(normal.market), source: 'TCGplayer (Normal)' };
    if (holofoil?.market && !isNaN(holofoil.market)) return { price: Number(holofoil.market), source: 'TCGplayer (Holofoil)' };
    if (reverseHolofoil?.market && !isNaN(reverseHolofoil.market)) return { price: Number(reverseHolofoil.market), source: 'TCGplayer (Reverse Holofoil)' };
    if (firstEdition?.market && !isNaN(firstEdition.market)) return { price: Number(firstEdition.market), source: 'TCGplayer (1st Edition Holofoil)' };
  }
  
  // Cardmarket prices
  if (card.cardmarket?.prices) {
    if (card.cardmarket.prices.averageSellPrice && !isNaN(card.cardmarket.prices.averageSellPrice)) 
      return { price: Number(card.cardmarket.prices.averageSellPrice), source: 'Cardmarket (Avg Sell Price)' };
    if (card.cardmarket.prices.trendPrice && !isNaN(card.cardmarket.prices.trendPrice)) 
      return { price: Number(card.cardmarket.prices.trendPrice), source: 'Cardmarket (Trend Price)' };
  }
  
  return { price: 0, source: 'No price data available' };
};

const getRarityOrder = (rarity: string): number => {
  const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX', 'Rare Ultra', 'Rare Secret'];
  return rarityOrder.indexOf(rarity);
};

export default function TCGMode() {
  const [cards, setCards] = useState<TCGCard[]>([])
  const [filteredCards, setFilteredCards] = useState<TCGCard[]>([])
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null)
  const [selectedType, setSelectedType] = useState<CardType>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sets, setSets] = useState<TCGSet[]>([])
  const [selectedSet, setSelectedSet] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchSets()
  }, [])

  useEffect(() => {
    if (selectedSet) {
      fetchCards(selectedSet)
    }
  }, [selectedSet])

  useEffect(() => {
    filterCards()
  }, [cards, selectedType, searchQuery, sortOrder])

  const fetchSets = async () => {
    try {
      const response = await fetch('https://api.pokemontcg.io/v2/sets', {
        headers: {
          'X-Api-Key': 'b66ce160-feb8-4d71-8628-203af6a73e4e'
        }
      })
      const data = await response.json()
      const sortedSets = data.data.sort((a: TCGSet, b: TCGSet) => 
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      )
      setSets(sortedSets)
      setSelectedSet(sortedSets[0].id)
    } catch (error) {
      console.error('Error fetching sets:', error)
      setError('Failed to load card sets. Please try again.')
    }
  }

  const fetchCards = async (setId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`, {
        headers: {
          'X-Api-Key': 'b66ce160-feb8-4d71-8628-203af6a73e4e'
        }
      })
      const data = await response.json()
      const sortedCards = data.data.sort((a: TCGCard, b: TCGCard) => 
        parseInt(a.number) - parseInt(b.number)
      )
      setCards(sortedCards)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching cards:', error)
      setIsLoading(false)
      setError('Failed to load cards. Please try again.')
    }
  }

  const filterCards = () => {
    let filtered = cards;
    if (selectedType !== 'All') {
      filtered = filtered.filter(card => card.supertype === selectedType);
    }
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.number.includes(searchQuery)
      );
    }
    
    switch (sortOrder) {
      case 'price-asc':
        filtered = filtered.sort((a, b) => {
          const priceA = getRelevantPrice(a).price;
          const priceB = getRelevantPrice(b).price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered = filtered.sort((a, b) => {
          const priceA = getRelevantPrice(a).price;
          const priceB = getRelevantPrice(b).price;
          return priceB - priceA;
        });
        break;
      case 'number-asc':
        filtered = filtered.sort((a, b) => Number(a.number) - Number(b.number));
        break;
      case 'number-desc':
        filtered = filtered.sort((a, b) => Number(b.number) - Number(a.number));
        break;
      case 'name-asc':
        filtered = filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered = filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'type-asc':
        filtered = filtered.sort((a, b) => (a.supertype || '').localeCompare(b.supertype || ''));
        break;
      case 'type-desc':
        filtered = filtered.sort((a, b) => (b.supertype || '').localeCompare(a.supertype || ''));
        break;
      case 'rarity-asc':
        filtered = filtered.sort((a, b) => getRarityOrder(a.rarity || '') - getRarityOrder(b.rarity || ''));
        break;
      case 'rarity-desc':
        filtered = filtered.sort((a, b) => getRarityOrder(b.rarity || '') - getRarityOrder(a.rarity || ''));
        break;
    }
    
    setFilteredCards(filtered);
  }

  const formatPrice = (price?: number) => {
    if (!price || isNaN(price)) return 'N/A';
    return `$${price.toFixed(2)}`;
  }

  const CardDisplay = ({ card }: { card: TCGCard }) => {
  const { price, source } = getRelevantPrice(card);
  return (
    <Card 
      className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white hover:bg-[rgba(24,191,191,0.2)] transition-colors cursor-pointer"
      onClick={() => setSelectedCard(card)}
    >
      <CardContent className="p-4 flex flex-col items-center">
        <div className="relative w-full h-[250px] mb-4">
          <img
            src={card.images.small || "/placeholder.svg"}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-center text-white"> {card.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <img
            src={card.set.images.symbol || "/placeholder.svg"}
            alt={card.set.name}
            className="w-6 h-6"
          />
          <span className="text-sm text-white">{card.set.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[rgba(24,191,191,0.2)] text-sm text-white">
            {card.number}/{card.set.printedTotal}
          </span>
          {card.rarity && (
            <span className="px-3 py-1 rounded-full bg-[rgba(24,191,191,0.2)] text-sm text-white">
              {card.rarity}
            </span>
          )}
        </div>
        <div className="mt-2 text-sm text-white">
          Price: {formatPrice(price)}
        </div>
        <div className="mt-1 text-xs opacity-70 text-white">
          {source}
        </div>
      </CardContent>
    </Card>
  )
}

  const CardDetailView = ({ card, onClose }: { card: TCGCard | null, onClose: () => void }) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Debounce the resize event
      timeoutId = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!card) return null;

  return (
    <Dialog open={!!card} onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#052e2e] border-[#18BFBF] text-white max-w-4xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold text-white">{card.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-80px)] px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center bg-[rgba(24,191,191,0.05)] rounded-lg p-4">
              <img
                src={card.images.large || "/placeholder.svg"}
                alt={card.name}
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>
            <div className="space-y-6">
              <div className="bg-[rgba(24,191,191,0.05)] p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-[#18BFBF]">Card Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-[#18BFBF]">Type</span>
                    <p className="font-medium text-white">{card.supertype}</p>
                  </div>
                  {card.hp && (
                    <div className="space-y-1">
                      <span className="text-sm text-[#18BFBF]">HP</span>
                      <p className="font-medium text-white">{card.hp}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-sm text-[#18BFBF]">Set</span>
                    <p className="font-medium text-white">{card.set.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-[#18BFBF]">Number</span>
                    <p className="font-medium text-white">{card.number}/{card.set.printedTotal}</p>
                  </div>
                  {card.rarity && (
                    <div className="space-y-1">
                      <span className="text-sm text-[#18BFBF]">Rarity</span>
                      <p className="font-medium text-white">{card.rarity}</p>
                    </div>
                  )}
                  {card.artist && (
                    <div className="space-y-1">
                      <span className="text-sm text-[#18BFBF]">Artist</span>
                      <p className="font-medium text-white">{card.artist}</p>
                    </div>
                  )}
                </div>
              </div>

              {card.attacks && card.attacks.length > 0 && (
                <div className="bg-[rgba(24,191,191,0.05)] p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-[#18BFBF]">Attacks</h3>
                  {card.attacks.map((attack, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg text-white">{attack.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">Damage: {attack.damage || '0'}</span>
                          <span className="text-sm text-white">Energy: {attack.convertedEnergyCost}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#18BFBF]/80 text-white">{attack.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {card.tcgplayer?.prices && (
                <div className="bg-[rgba(24,191,191,0.05)] p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-[#18BFBF]">Market Prices</h3>
                  {card.tcgplayer?.prices && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-white">TCGplayer</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(card.tcgplayer.prices).map(([priceType, priceData]) => (
                          priceData && (
                            <div key={priceType} className="bg-[rgba(24,191,191,0.1)] p-3 rounded">
                              <span className="block text-sm text-[#18BFBF] text-white">{priceType}</span>
                              <span className="block font-medium text-white">${priceData.market?.toFixed(2) || 'N/A'}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

  return (
    <div className="p-4 bg-[#0F2F2F] text-white h-full overflow-y-auto">
      <h2 className="text-2xl uppercase tracking-wider mb-6 text-white">Pokémon TCG Explorer</h2>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white placeholder:text-white/50 pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-50" />
        </div>
        <Select
          value={selectedType}
          onValueChange={(value: CardType) => setSelectedType(value)}
        >
          <SelectTrigger className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            {CARD_TYPES.map((type) => (
              <SelectItem 
                key={type} 
                value={type}
                className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedSet}
          onValueChange={(value: string) => setSelectedSet(value)}
        >
          <SelectTrigger className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white">
            <SelectValue placeholder="Select set" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF] max-h-[300px] overflow-y-auto">
            {sets.map((set) => (
              <SelectItem 
                key={set.id} 
                value={set.id}
                className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {set.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value: SortOrder) => setSortOrder(value)}
        >
          <SelectTrigger className="w-full bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            <SelectItem 
              value="none"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Default Order
            </SelectItem>
            <SelectItem 
              value="price-asc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Price: Low to High
            </SelectItem>
            <SelectItem 
              value="price-desc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Price: High to Low
            </SelectItem>
            <SelectItem 
              value="number-asc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Number: Low to High
            </SelectItem>
            <SelectItem 
              value="number-desc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Number: High to Low
            </SelectItem>
            <SelectItem 
              value="name-asc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Name: A to Z
            </SelectItem>
            <SelectItem 
              value="name-desc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Name: Z to A
            </SelectItem>
            <SelectItem 
              value="type-asc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Type: A to Z
            </SelectItem>
            <SelectItem 
              value="type-desc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Type: Z to A
            </SelectItem>
            <SelectItem 
              value="rarity-asc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Rarity: Common to Rare
            </SelectItem>
            <SelectItem 
              value="rarity-desc"
              className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
            >
              Rarity: Rare to Common
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white hover:bg-[rgba(24,191,191,0.2)]"
        >
          {viewMode === 'grid' ? 'List View' : 'Grid View'}
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 text-white">{error}</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}`}>
          {filteredCards.map(card => (
            <CardDisplay key={card.id} card={card} />
          ))}
        </div>
      )}
      {selectedCard && (
        <CardDetailView 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </div>
  )
}

