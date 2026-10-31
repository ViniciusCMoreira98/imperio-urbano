package br.imperiourbano.catalog;

/** Efeito de uma carta; só os campos do respectivo tipo são preenchidos (mesma forma do JSON). */
public record CardEffect(
        CardEffectType type,
        Integer amount,
        Integer tile,
        Integer steps,
        Integer perHouse,
        Integer perHotel) {
}
