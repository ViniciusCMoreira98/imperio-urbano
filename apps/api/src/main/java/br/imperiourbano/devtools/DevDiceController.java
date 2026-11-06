package br.imperiourbano.devtools;

import br.imperiourbano.engine.DiceRoll;
import br.imperiourbano.game.GameService;
import br.imperiourbano.game.RiggedDice;
import br.imperiourbano.identity.GuestPrincipal;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Ferramenta de desenvolvedor: escolher o próximo lance de uma partida para testar casas específicas.
 * Só existe com {@code app.dev-tools.enabled=true}; em produção a rota nem é registrada (404).
 */
@RestController
@RequestMapping("/api/dev/games")
@ConditionalOnProperty(name = "app.dev-tools.enabled", havingValue = "true")
class DevDiceController {

    record NextDiceRequest(int first, int second) {
    }

    private final RiggedDice rigged;
    private final GameService games;

    DevDiceController(RiggedDice rigged, GameService games) {
        this.rigged = rigged;
        this.games = games;
    }

    @PostMapping("/{gameId}/next-dice")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void nextDice(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId,
            @RequestBody NextDiceRequest request) {
        var state = games.current(gameId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partida não encontrada"));
        if (state.players().stream().noneMatch(p -> p.id().equals(player.playerId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não está nesta partida");
        }
        DiceRoll roll;
        try {
            roll = new DiceRoll(request.first(), request.second());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        rigged.setNext(gameId, roll);
    }
}
