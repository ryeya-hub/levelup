import { BRAND } from '../brand.js'
import light from '../assets/brand/levelup-wordmark.svg'
import dark from '../assets/brand/levelup-wordmark-dark.svg'

export default function BrandLogo() {
  return <div className="brand-wordmark">
    <img className="brand-on-light" src={light} alt={BRAND.name} width="260" height="64" />
    <img className="brand-on-dark" src={dark} alt={BRAND.name} width="260" height="64" />
  </div>
}
